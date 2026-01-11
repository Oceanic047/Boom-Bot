export interface CoinMetadata {
  mint: string;
  name: string;
  symbol: string;
  description?: string;
  image_uri?: string;
  created_timestamp: number;
}

export interface CoinSignals {
  volume24h: number;
  liquidity: number;
  holderCount: number;
  priceChange24h?: number;
  marketCap?: number;
}

export interface CoinData extends CoinMetadata, CoinSignals {
  age: number; // in seconds
}

export interface TrendScore {
  score: number; // 0-100
  breakdown: {
    volumeScore: number;
    liquidityScore: number;
    holderScore: number;
    ageScore: number;
  };
}

export interface AlertData {
  coin: CoinData;
  trendScore: TrendScore;
  timestamp: number;
}
