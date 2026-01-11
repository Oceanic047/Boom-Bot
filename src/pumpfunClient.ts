import axios from 'axios';
import { config } from './config';
import { CoinData } from './types';

export class PumpFunClient {
  private baseUrl: string;
  private seenCoins: Set<string> = new Set();

  constructor() {
    this.baseUrl = config.pumpfunApiUrl;
  }

  /**
   * Fetch recent coin launches from Pump.fun API
   */
  async fetchRecentCoins(): Promise<CoinData[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          limit: 50,
          offset: 0,
          sort: 'created_timestamp',
          order: 'DESC',
        },
        timeout: 10000,
      });

      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid response from Pump.fun API');
        return [];
      }

      const now = Date.now();
      const coins: CoinData[] = response.data.map((coin: any) => {
        const createdTime = coin.created_timestamp * 1000; // Convert to milliseconds
        return {
          mint: coin.mint || coin.address || '',
          name: coin.name || 'Unknown',
          symbol: coin.symbol || 'N/A',
          description: coin.description || '',
          image_uri: coin.image_uri || coin.image || '',
          created_timestamp: coin.created_timestamp || Math.floor(now / 1000),
          age: Math.floor((now - createdTime) / 1000), // Age in seconds
          volume24h: parseFloat(coin.usd_market_cap || coin.volume_24h || '0'),
          liquidity: parseFloat(coin.virtual_sol_reserves || coin.liquidity || '0'),
          holderCount: parseInt(coin.holder_count || coin.holders || '0', 10),
          priceChange24h: parseFloat(coin.price_change_24h || '0'),
          marketCap: parseFloat(coin.usd_market_cap || '0'),
        };
      });

      return coins;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching coins from Pump.fun:', error.message);
      } else {
        console.error('Unexpected error fetching coins:', error);
      }
      return [];
    }
  }

  /**
   * Filter for new coins that haven't been seen before
   */
  filterNewCoins(coins: CoinData[]): CoinData[] {
    const newCoins = coins.filter(coin => !this.seenCoins.has(coin.mint));
    
    // Add new coins to seen set
    newCoins.forEach(coin => this.seenCoins.add(coin.mint));
    
    // Keep seenCoins set manageable (keep only last 1000)
    if (this.seenCoins.size > 1000) {
      const coinsArray = Array.from(this.seenCoins);
      this.seenCoins = new Set(coinsArray.slice(-1000));
    }
    
    return newCoins;
  }

  /**
   * Check if a coin meets minimum thresholds
   */
  meetsThresholds(coin: CoinData): boolean {
    return (
      coin.volume24h >= config.minVolumeThreshold ||
      coin.liquidity >= config.minLiquidityThreshold ||
      coin.holderCount >= config.minHolderCount
    );
  }
}
