export interface PolymarketTag {
  id: string | null
  label: string | null
  slug: string | null
}

export interface PolymarketMarket {
  conditionId: string
  question: string
  outcomes: string[]
  outcomePrices: number[]
  volume: number | null
  volume24hr: number | null
  liquidity: number | null
  active: boolean
  closed: boolean
  endDate: string | null
  startDate: string | null
  slug: string | null
  image: string | null
  tags: PolymarketTag[]
}

export interface PolymarketEvent {
  id: string
  title: string
  slug: string | null
  description: string | null
  active: boolean
  closed: boolean
  volume: number | null
  startDate: string | null
  endDate: string | null
  image: string | null
  tags: PolymarketTag[]
  markets: PolymarketMarket[]
}

export interface MarketsResponse {
  markets: PolymarketMarket[]
  count: number
  last_updated: string
}

export interface MarketResponse {
  market: PolymarketMarket
  last_updated: string
}

export interface EventsResponse {
  events: PolymarketEvent[]
  count: number
  last_updated: string
}

export interface GetMarketsParams {
  limit?: number
  offset?: number
  active?: boolean
  closed?: boolean
  tagSlug?: string
  order?: string
  ascending?: boolean
  q?: string
}
