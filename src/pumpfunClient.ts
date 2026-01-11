import axios from 'axios';
import { config } from './config';
import { CoinData } from './types';

export class PumpFunClient {
  private moralisApiKey: string;
  private moralisBaseUrl: string;
  private pumpfunProgramAddress: string;
  private seenCoins: Set<string> = new Set();

  constructor() {
    this.moralisApiKey = config.moralisApiKey;
    this.moralisBaseUrl = config.moralisBaseUrl;
    this.pumpfunProgramAddress = config.pumpfunProgramAddress;
  }

  /**
   * Fetch recent coin launches from Moralis API for Pump.fun tokens
   */
  async fetchRecentCoins(): Promise<CoinData[]> {
    try {
      // Use Moralis API to get SPL tokens filtered by Pump.fun program
      const endpoint = `${this.moralisBaseUrl}/token/mainnet/pairs`;
      
      const response = await axios.get(endpoint, {
        headers: {
          'X-API-Key': this.moralisApiKey,
          'accept': 'application/json',
        },
        params: {
          limit: 50,
        },
        timeout: 10000,
      });

      if (!response.data) {
        console.error('Invalid response from Moralis API');
        return [];
      }

      // Handle both array and object with result property
      const dataArray = Array.isArray(response.data) ? response.data : (response.data.result || []);

      if (!Array.isArray(dataArray)) {
        console.error('Expected array in Moralis API response');
        return [];
      }

      const now = Date.now();
      const coins: CoinData[] = dataArray
        .filter((token: any) => {
          // Filter for Pump.fun tokens if program address is available
          return !token.program || token.program === this.pumpfunProgramAddress;
        })
        .map((token: any) => {
          // Parse creation timestamp - Moralis may provide it in different formats
          let createdTime = now;
          if (token.createdAt) {
            createdTime = new Date(token.createdAt).getTime();
          } else if (token.created_timestamp) {
            createdTime = token.created_timestamp * 1000;
          } else if (token.blockTimestamp) {
            createdTime = token.blockTimestamp * 1000;
          }
          
          // Extract token metadata
          const tokenAddress = token.tokenAddress || token.mint || token.address || '';
          const name = token.name || token.baseToken?.name || 'Unknown';
          const symbol = token.symbol || token.baseToken?.symbol || 'N/A';
          
          // Extract market data - Moralis structure may vary
          const volume24h = parseFloat(
            token.volume24h || 
            token.volume?.h24 || 
            token.priceChange?.h24 || 
            '0'
          );
          
          const liquidity = parseFloat(
            token.liquidity?.usd || 
            token.liquidityUsd || 
            token.reserves || 
            '0'
          );
          
          const marketCap = parseFloat(
            token.fdv || 
            token.marketCap || 
            token.fullyDilutedValuation || 
            '0'
          );
          
          // Holder count may not be available in all responses
          const holderCount = parseInt(
            token.holders || 
            token.holderCount || 
            '0', 
            10
          );
          
          return {
            mint: tokenAddress,
            name: name,
            symbol: symbol,
            description: token.description || '',
            image_uri: token.image || token.imageUrl || token.logo || '',
            created_timestamp: Math.floor(createdTime / 1000),
            age: Math.floor((now - createdTime) / 1000), // Age in seconds
            volume24h: volume24h,
            liquidity: liquidity,
            holderCount: holderCount,
            priceChange24h: parseFloat(token.priceChange24h || token.priceChange?.percentage || '0'),
            marketCap: marketCap,
          };
        });

      return coins;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching coins from Moralis API:', error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', JSON.stringify(error.response.data).substring(0, 200));
        }
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
