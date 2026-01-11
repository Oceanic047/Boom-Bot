import dotenv from 'dotenv';

dotenv.config();

export const config = {
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
  pumpfunApiUrl: process.env.PUMPFUN_API_URL || 'https://frontend-api.pump.fun/coins',
  pollInterval: parseInt(process.env.POLL_INTERVAL || '60', 10) * 1000,
  
  // Alert threshold
  alertScoreThreshold: parseInt(process.env.ALERT_SCORE_THRESHOLD || '50', 10),
  
  // Thresholds for trend scoring
  minVolumeThreshold: parseFloat(process.env.MIN_VOLUME_THRESHOLD || '1000'),
  minLiquidityThreshold: parseFloat(process.env.MIN_LIQUIDITY_THRESHOLD || '5000'),
  minHolderCount: parseInt(process.env.MIN_HOLDER_COUNT || '10', 10),
  
  // Weights for trend score calculation (should sum to 1.0)
  volumeGrowthWeight: parseFloat(process.env.VOLUME_GROWTH_WEIGHT || '0.4'),
  liquidityWeight: parseFloat(process.env.LIQUIDITY_WEIGHT || '0.3'),
  holderWeight: parseFloat(process.env.HOLDER_WEIGHT || '0.2'),
  ageWeight: parseFloat(process.env.AGE_WEIGHT || '0.1'),
};

export function validateConfig(): boolean {
  if (!config.discordWebhookUrl) {
    console.error('Error: DISCORD_WEBHOOK_URL is not set in .env file');
    return false;
  }
  
  const totalWeight = config.volumeGrowthWeight + config.liquidityWeight + 
                     config.holderWeight + config.ageWeight;
  
  if (Math.abs(totalWeight - 1.0) > 0.01) {
    console.warn(`Warning: Weights sum to ${totalWeight}, expected 1.0`);
  }
  
  return true;
}
