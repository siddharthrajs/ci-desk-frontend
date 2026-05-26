import { useEffect, useRef, useState } from 'react'
import { API_BASE_URL } from '../lib/config'

export interface QuoteData {
  bid: number | null
  ask: number | null
  mid: number | null
  settlement: number | null
  state: string | null
  lastUpdate: number
}

export interface InstrumentMeta {
  product: string
  tenor: string
  label: string
  instrument_type: string
}

export interface CurvePoint {
  tenor: string
  label: string
  bid: number | null
  ask: number | null
  mid: number | null
  settlement: number | null
  state: string | null
}

/**
 * Curves nested by product and instrument_type.
 * e.g. curves['Brent']['OUTRIGHT'], curves['Brent']['1MS'], curves['Brent']['FLY']
 */
export type ProductCurves = Record<string, Record<string, CurvePoint[]>>

const TENOR_ORDER: Record<string, number> = {
  F: 1, G: 2, H: 3, J: 4, K: 5, M: 6,
  N: 7, Q: 8, U: 9, V: 10, X: 11, Z: 12,
}

function tenorSortKey(tenor: string): number {
  // For spreads "M26-N26", sort by the first leg's month/year.
  const head = tenor.split('-')[0] ?? tenor
  const letter = head[0]
  const year = parseInt(head.slice(1), 10)
  return year * 100 + (TENOR_ORDER[letter] ?? 99)
}

function parsePrice(val: unknown): number | null {
  if (val === null || val === undefined) return null
  if (typeof val === 'number') return isNaN(val) ? null : val
  const s = String(val).trim()
  if (s === '' || s === 'NaN' || s === 'null' || s === 'undefined') return null
  const n = parseFloat(s)
  return isNaN(n) ? null : n
}

function buildWsUrl(): string {
  const base = API_BASE_URL.replace(/^http/, 'ws')
  return `${base}/api/markets/ws`
}

interface HookState {
  connected: boolean
  curves: ProductCurves
  quotes: Record<string, QuoteData>
  lookup: Record<string, InstrumentMeta>
  lastTick: number | null
  feedError: string | null
}

export function useMarketWebSocket() {
  const [state, setState] = useState<HookState>({
    connected: false,
    curves: {},
    quotes: {},
    lookup: {},
    lastTick: null,
    feedError: null,
  })

  const quotesRef = useRef<Record<string, QuoteData>>({})
  const lookupRef = useRef<Record<string, InstrumentMeta>>({})
  const pendingRef = useRef<Record<string, QuoteData>>({})
  const rafRef = useRef<number | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  function buildCurves(quotes: Record<string, QuoteData>, lookup: Record<string, InstrumentMeta>): ProductCurves {
    const byProduct: ProductCurves = {}
    for (const [instrumentId, meta] of Object.entries(lookup)) {
      const q = quotes[instrumentId]
      if (!byProduct[meta.product]) byProduct[meta.product] = {}
      if (!byProduct[meta.product][meta.instrument_type]) byProduct[meta.product][meta.instrument_type] = []
      byProduct[meta.product][meta.instrument_type].push({
        tenor: meta.tenor,
        label: meta.label,
        bid: q?.bid ?? null,
        ask: q?.ask ?? null,
        mid: q?.mid ?? null,
        settlement: q?.settlement ?? null,
        state: q?.state ?? null,
      })
    }
    for (const byType of Object.values(byProduct)) {
      for (const arr of Object.values(byType)) {
        arr.sort((a, b) => tenorSortKey(a.tenor) - tenorSortKey(b.tenor))
      }
    }
    return byProduct
  }

  function flushPending() {
    rafRef.current = null
    const pending = pendingRef.current
    if (Object.keys(pending).length === 0) return
    pendingRef.current = {}

    const nextQuotes = { ...quotesRef.current, ...pending }
    quotesRef.current = nextQuotes

    setState(prev => ({
      ...prev,
      quotes: nextQuotes,
      curves: buildCurves(nextQuotes, lookupRef.current),
      lastTick: Date.now(),
    }))
  }

  function scheduleFlush() {
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(flushPending)
    }
  }

  function handleMessage(raw: string) {
    let msg: Record<string, unknown>
    try {
      msg = JSON.parse(raw)
    } catch {
      return
    }

    if (msg.type === 'ping') return

    if (msg.type === 'error') {
      setState(prev => ({ ...prev, feedError: String(msg.message ?? 'feed not configured') }))
      return
    }

    if (msg.type === 'feed_down') {
      quotesRef.current = {}
      pendingRef.current = {}
      setState(prev => ({
        ...prev,
        feedError: 'feed down — LS_L1.py not running',
        curves: {},
        quotes: {},
        lastTick: null,
      }))
      return
    }

    if (msg.type === 'feed_up') {
      setState(prev => ({ ...prev, feedError: null }))
      return
    }

    const instrumentId = msg.instrumentId as string | undefined
    if (!instrumentId) return

    const bid = parsePrice(msg.bidPrice)
    const ask = parsePrice(msg.askPrice)
    let mid: number | null = null
    if (bid !== null && ask !== null) {
      mid = (bid + ask) / 2
    } else if (bid !== null) {
      mid = bid
    } else if (ask !== null) {
      mid = ask
    }

    const prev = pendingRef.current[instrumentId] ?? quotesRef.current[instrumentId]
    pendingRef.current[instrumentId] = {
      bid: bid ?? prev?.bid ?? null,
      ask: ask ?? prev?.ask ?? null,
      mid: mid ?? prev?.mid ?? null,
      settlement: parsePrice(msg.settlementPrice) ?? prev?.settlement ?? null,
      state: (msg.state as string | null) ?? prev?.state ?? null,
      lastUpdate: Date.now(),
    }
    scheduleFlush()
  }

  function connect() {
    if (!mountedRef.current) return
    const ws = new WebSocket(buildWsUrl())
    wsRef.current = ws

    ws.onopen = () => {
      if (!mountedRef.current) { ws.close(); return }
      setState(prev => ({ ...prev, connected: true, feedError: null }))
    }

    ws.onmessage = (e) => {
      if (!mountedRef.current) return
      handleMessage(e.data)
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      setState(prev => ({ ...prev, connected: false }))
      reconnectRef.current = setTimeout(() => {
        if (mountedRef.current) connect()
      }, 3000)
    }

    ws.onerror = () => {
      ws.close()
    }
  }

  useEffect(() => {
    mountedRef.current = true
    async function init() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/markets/instruments`)
        if (!res.ok) throw new Error('Failed to fetch instruments')
        const data = await res.json()

        const lookup: Record<string, InstrumentMeta> = {}
        const products: Record<string, { enabled: boolean; instruments: Array<{
          instrument_id: string | null
          instrument_type: string
          tenor: string
          label: string
          enabled: boolean
        }> }> = data.products ?? {}

        for (const [product, productData] of Object.entries(products)) {
          if (!productData.enabled) continue
          for (const instr of productData.instruments) {
            if (instr.enabled && instr.instrument_id) {
              lookup[instr.instrument_id] = {
                product,
                tenor: instr.tenor,
                label: instr.label,
                instrument_type: instr.instrument_type,
              }
            }
          }
        }

        lookupRef.current = lookup
        setState(prev => ({ ...prev, lookup }))
      } catch (err) {
        console.error('Failed to load instruments:', err)
      }
      connect()
    }

    init()

    return () => {
      mountedRef.current = false
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      if (reconnectRef.current !== null) clearTimeout(reconnectRef.current)
      wsRef.current?.close()
    }
  }, [])

  return {
    connected: state.connected,
    curves: state.curves,
    quotes: state.quotes,
    lookup: state.lookup,
    lastTick: state.lastTick,
    feedError: state.feedError,
  }
}
