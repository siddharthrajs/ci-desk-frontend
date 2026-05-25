import { Panel } from '../components/ui/Panel'
import { Badge, Pill } from '../components/ui/Badge'
import { DataValue } from '../components/ui/DataValue'
import { Sparkline } from '../components/ui/Sparkline'
import { StatCard } from '../components/ui/StatCard'
import { DataTable } from '../components/ui/DataTable'
import type { ColumnDef } from '../components/ui/DataTable'

// ── Section wrapper ─────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.14em',
        color: 'var(--color-text-tertiary)',
        textTransform: 'uppercase',
        borderLeft: '2px solid var(--color-amber)',
        paddingLeft: 10,
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

// ── OPEC+ table data ────────────────────────────────────────────────────────
interface OpecRow extends Record<string, unknown> {
  country:    string
  quota:      number | null
  prod:       number
  qoq:        number | null
  compliance: number | null
  trend:      number[]
}

const OPEC_ROWS: OpecRow[] = [
  { country: 'SAUDI ARABIA', quota: 10.478, prod: 10.31, qoq: -0.11, compliance: 101.6, trend: [10.4, 10.5, 10.42, 10.38, 10.31, 10.31] },
  { country: 'IRAQ',         quota:  4.220, prod:  4.34, qoq: +0.07, compliance:  97.2, trend: [4.18, 4.22, 4.28, 4.30, 4.34, 4.34] },
  { country: 'UAE',          quota:  3.219, prod:  3.27, qoq: +0.09, compliance:  98.4, trend: [3.21, 3.20, 3.22, 3.24, 3.27, 3.27] },
  { country: 'KUWAIT',       quota:  2.548, prod:  2.51, qoq: -0.04, compliance: 101.5, trend: [2.55, 2.54, 2.53, 2.52, 2.51, 2.51] },
  { country: 'IRAN+',        quota:   null, prod:  3.19, qoq: +0.14, compliance:   null, trend: [3.00, 3.05, 3.10, 3.15, 3.18, 3.19] },
  { country: 'NIGERIA',      quota:  1.500, prod:  1.34, qoq: -0.07, compliance: 110.4, trend: [1.42, 1.40, 1.38, 1.36, 1.34, 1.34] },
  { country: 'ALGERIA',      quota:  0.908, prod:  0.91, qoq: -0.01, compliance:  99.8, trend: [0.92, 0.92, 0.91, 0.91, 0.91, 0.91] },
  { country: 'VENEZUELA+',   quota:   null, prod:  0.83, qoq: +0.04, compliance:   null, trend: [0.78, 0.80, 0.81, 0.82, 0.83, 0.83] },
  { country: 'KAZAKHSTAN',   quota:  1.468, prod:  1.55, qoq: +0.06, compliance:  94.6, trend: [1.48, 1.50, 1.51, 1.53, 1.55, 1.55] },
  { country: 'RUSSIA',       quota:  9.949, prod: 10.04, qoq: +0.03, compliance:  99.1, trend: [9.98, 9.99, 10.00, 10.02, 10.04, 10.04] },
  { country: 'OMAN',         quota:  0.756, prod:  0.76, qoq: -0.01, compliance: 100.0, trend: [0.77, 0.77, 0.76, 0.76, 0.76, 0.76] },
  { country: 'OPEC+ TOTAL',  quota: 40.460, prod: 40.78, qoq: +0.27, compliance:  99.2, trend: [40.2, 40.3, 40.5, 40.6, 40.7, 40.78] },
]

const OPEC_COLS: ColumnDef<OpecRow>[] = [
  { key: 'country', header: 'Country', align: 'left', width: 160,
    render: row => (
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: row.country === 'OPEC+ TOTAL' ? 700 : 500,
        color: row.country === 'OPEC+ TOTAL' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
      }}>
        {row.country}
      </span>
    ),
  },
  { key: 'quota', header: 'Quota MBD', align: 'right', decimals: 3,
    render: row => row.quota === null
      ? <span style={{ color: 'var(--color-text-tertiary)' }}>—</span>
      : <span>{row.quota.toFixed(3)}</span>,
  },
  { key: 'prod',       header: 'Prod MBD',   align: 'right', decimals: 2 },
  { key: 'qoq',        header: 'QoQ Δ',       align: 'right', isChange: true, decimals: 2 },
  { key: 'compliance', header: 'Compl %',     align: 'right',
    render: row => {
      if (row.compliance === null) return <span style={{ color: 'var(--color-text-tertiary)' }}>n/a</span>
      const c = row.compliance
      const color = c >= 100 ? 'var(--color-bull)' : c >= 95 ? 'var(--color-amber)' : 'var(--color-bear)'
      return <span style={{ color, fontFamily: 'var(--font-mono)' }}>{c.toFixed(1)}%</span>
    },
  },
  { key: 'trend', header: '300D Trend', align: 'center', isSparkline: true },
]

// ── Showcase ────────────────────────────────────────────────────────────────
export function Showcase() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Page header */}
      <div>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          COMPONENT SHOWCASE
        </h1>
        <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em' }}>
          BUILDING BLOCKS · DESIGN TOKENS VERIFIED
        </p>
      </div>

      {/* ── 1. Panel ─────────────────────────────────────────────── */}
      <Section title="Panel — container card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          <Panel
            title="Panel — basic"
            subtitle="No header-right, no subtitle override"
          >
            <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
              Body content goes here. The panel provides consistent
              background, border, header styling, and 20px body padding.
            </p>
          </Panel>

          <Panel
            title="OPEC+ Production Monitor"
            subtitle="MAY 2026 · MOMR-IEA RECONCILED"
            headerRight={
              <>
                <Badge variant="muted">SOURCE · MOMR</Badge>
                <Badge variant="default">UPDATED 13:12 UTC</Badge>
              </>
            }
          >
            <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
              Panel with full header: title, subtitle, and right-side badges.
            </p>
          </Panel>

        </div>
      </Section>

      {/* ── 2. Badge & Pill ───────────────────────────────────────── */}
      <Section title="Badge & Pill — variants">
        <Panel title="Badge / Pill Variants" noPadding={false}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="label" style={{ marginBottom: 4 }}>Badge (square corners, 3px radius)</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <Badge variant="default">DEFAULT</Badge>
                <Badge variant="active">ACTIVE</Badge>
                <Badge variant="muted">MUTED</Badge>
                <Badge variant="bull">BULL</Badge>
                <Badge variant="bear">BEAR</Badge>
                <Badge variant="default">SOURCE · MOMR</Badge>
                <Badge variant="muted">BAKER HUGHES</Badge>
                <Badge variant="muted">EIA-914</Badge>
                <Badge variant="active">VAR A</Badge>
                <Badge variant="default">TABLE</Badge>
                <Badge variant="default">CHART</Badge>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="label" style={{ marginBottom: 4 }}>Pill (999px radius)</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <Pill variant="default">DEFAULT</Pill>
                <Pill variant="active">ACTIVE</Pill>
                <Pill variant="muted">MUTED</Pill>
                <Pill variant="bull">LONG</Pill>
                <Pill variant="bear">SHORT</Pill>
                <Pill variant="default" dot dotColor="var(--color-bull)">CONNECTED · 4 STREAMS</Pill>
                <Pill variant="muted" dot dotColor="var(--color-amber)">WORKSPACE: DESK-01</Pill>
              </div>
            </div>

          </div>
        </Panel>
      </Section>

      {/* ── 3. DataValue ─────────────────────────────────────────── */}
      <Section title="DataValue — sizes & states">
        <Panel title="DataValue — sm · md · lg · hero">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="label">sm</div>
              <DataValue value={82.47}   change={+1.23}  size="sm" />
              <DataValue value={2.4410}  change={-0.012} size="sm" decimals={4} />
              <DataValue value={74.55}   change={0}      size="sm" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="label">md</div>
              <DataValue value={85.12}   change={+0.51}  size="md" unit="USD" />
              <DataValue value={2.6710}  change={-0.008} size="md" decimals={4} />
              <DataValue value={98.4}    change={+0.3}   size="md" unit="%" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="label">lg</div>
              <DataValue value={13.42}   change={+0.08}  size="lg" unit="MBD" changeLabel="MOM" decimals={2} />
              <DataValue value={498}     change={-4}     size="lg" unit="RIGS" decimals={0} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="label">hero — KPI</div>
              <DataValue
                value={4612}
                change={-86}
                changeLabel="MOM DRAINING"
                size="hero"
                decimals={0}
              />
            </div>

          </div>
        </Panel>
      </Section>

      {/* ── 4. Sparkline ─────────────────────────────────────────── */}
      <Section title="Sparkline — inline mini chart">
        <Panel title="Sparkline — variants & auto-color">
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {[
              { label: 'Bull / Uptrend',    color: 'bull'  as const, data: [10, 11, 10.5, 12, 13, 12.8, 14] },
              { label: 'Bear / Downtrend',  color: 'bear'  as const, data: [14, 13, 13.5, 12, 11, 11.2, 10] },
              { label: 'Amber / Neutral',   color: 'amber' as const, data: [10, 10.5, 9.8, 10.2, 10.1, 10.4, 10.3] },
              { label: 'Auto-color (bull)',  color: undefined, data: [8, 9, 9.5, 10, 11, 12, 13], autoColor: true },
              { label: 'Auto-color (bear)',  color: undefined, data: [13, 12, 11, 10, 9, 8.5, 8], autoColor: true },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="label">{s.label}</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)', marginBottom: 3 }}>line</div>
                    <Sparkline data={s.data} color={s.color} autoColor={s.autoColor} width={80} height={28} variant="line" />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)', marginBottom: 3 }}>area</div>
                    <Sparkline data={s.data} color={s.color} autoColor={s.autoColor} width={80} height={28} variant="area" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </Section>

      {/* ── 5. StatCard ──────────────────────────────────────────── */}
      <Section title="StatCard — KPI mini cards">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          <StatCard label="Group Avg Compliance" value={99.2} unit="%" change={+0.4} changeLabel="MOM" decimals={1} />
          <StatCard label="Cuts Active"           value="3.66 MBD" note="vs 3.60 target" />
          <StatCard label="Next Meeting"          value="JUN 02" note="Extraordinary session" decimals={0} />
          <StatCard label="US Crude Production"   value={13.42} unit="MBD" change={+0.08} changeLabel="WoW" decimals={2} />
          <StatCard label="Oil Rig Count"         value={498} change={-4} decimals={0} note="Weekly Baker Hughes" />
          <StatCard label="DUC Wells"             value={4612} change={-86} changeLabel="MOM" decimals={0} />
          <StatCard label="Surplus / Deficit"     value={+0.3} unit="MBD" change={+0.1} decimals={1} note="2026 Q2 forecast" />
          <StatCard label="Call on OPEC+"         value={40.46} unit="MBD" decimals={2} />
        </div>
      </Section>

      {/* ── 6. DataTable ─────────────────────────────────────────── */}
      <Section title="DataTable — OPEC+ Production Monitor">
        <Panel
          title="OPEC+ Production Monitor"
          subtitle="MAY 2026 · MOMR-IEA RECONCILED"
          noPadding
          headerRight={
            <>
              <Badge variant="muted">SOURCE · MOMR</Badge>
              <Badge variant="default">UPDATED 13:12 UTC</Badge>
            </>
          }
        >
          <DataTable<OpecRow>
            columns={OPEC_COLS}
            rows={OPEC_ROWS}
            rowKey="country"
            isTotalRow={row => row.country === 'OPEC+ TOTAL'}
          />
          <div style={{ padding: '8px 10px', borderTop: '1px solid var(--color-border)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em' }}>
              + EXEMPT FROM QUOTAS — IRAN, VENEZUELA, LIBYA
            </span>
          </div>
        </Panel>
      </Section>

    </div>
  )
}
