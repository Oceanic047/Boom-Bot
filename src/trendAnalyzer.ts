import { config } from './config';
import { CoinData, TrendScore } from './types';

export class TrendAnalyzer {
  /**
   * Calculate a trend score (0-100) based on coin signals and metadata
   */
  calculateTrendScore(coin: CoinData): TrendScore {
    const volumeScore = this.calculateVolumeScore(coin.volume24h);
    const liquidityScore = this.calculateLiquidityScore(coin.liquidity);
    const holderScore = this.calculateHolderScore(coin.holderCount);
    const ageScore = this.calculateAgeScore(coin.age);

    // Weighted average
    const score = Math.min(
      100,
      Math.max(
        0,
        volumeScore * config.volumeGrowthWeight +
        liquidityScore * config.liquidityWeight +
        holderScore * config.holderWeight +
        ageScore * config.ageWeight
      )
    );

    return {
      score: Math.round(score),
      breakdown: {
        volumeScore: Math.round(volumeScore),
        liquidityScore: Math.round(liquidityScore),
        holderScore: Math.round(holderScore),
        ageScore: Math.round(ageScore),
      },
    };
  }

  /**
   * Calculate volume score based on 24h volume
   * Higher volume = higher score (up to 100)
   */
  private calculateVolumeScore(volume: number): number {
    if (volume <= 0) return 0;
    
    // Logarithmic scale: every 10x increase adds ~33 points
    const normalizedVolume = volume / config.minVolumeThreshold;
    const score = 33 * Math.log10(Math.max(1, normalizedVolume));
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate liquidity score based on available liquidity
   * Higher liquidity = more stable, higher score
   */
  private calculateLiquidityScore(liquidity: number): number {
    if (liquidity <= 0) return 0;
    
    // Logarithmic scale
    const normalizedLiquidity = liquidity / config.minLiquidityThreshold;
    const score = 33 * Math.log10(Math.max(1, normalizedLiquidity));
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate holder score based on number of holders
   * More holders = more distribution, higher score
   */
  private calculateHolderScore(holderCount: number): number {
    if (holderCount <= 0) return 0;
    
    // Logarithmic scale
    const normalizedHolders = holderCount / config.minHolderCount;
    const score = 33 * Math.log10(Math.max(1, normalizedHolders));
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate age score
   * Newer coins (< 1 hour) get bonus points for being early
   * Older coins (> 24 hours) get penalized
   */
  private calculateAgeScore(ageInSeconds: number): number {
    const ageInHours = ageInSeconds / 3600;
    
    if (ageInHours < 1) {
      // Very new: 80-100 points
      return 100 - (ageInHours * 20);
    } else if (ageInHours < 6) {
      // Recent: 60-80 points
      return 80 - ((ageInHours - 1) * 4);
    } else if (ageInHours < 24) {
      // Moderate: 20-60 points
      return 60 - ((ageInHours - 6) * 2.22);
    } else {
      // Old: 0-20 points
      return Math.max(0, 20 - ((ageInHours - 24) * 0.5));
    }
  }

  /**
   * Determine if a coin should trigger an alert based on trend score
   */
  shouldAlert(trendScore: TrendScore): boolean {
    // Alert if trend score is above 50 (configurable threshold)
    return trendScore.score >= 50;
  }
}
