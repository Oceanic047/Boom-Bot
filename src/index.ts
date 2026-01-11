import { config, validateConfig } from './config';
import { PumpFunClient } from './pumpfunClient';
import { TrendAnalyzer } from './trendAnalyzer';
import { DiscordNotifier } from './discordNotifier';
import { AlertData } from './types';

class BoomBot {
  private pumpFunClient: PumpFunClient;
  private trendAnalyzer: TrendAnalyzer;
  private discordNotifier: DiscordNotifier;
  private isRunning: boolean = false;

  constructor() {
    this.pumpFunClient = new PumpFunClient();
    this.trendAnalyzer = new TrendAnalyzer();
    this.discordNotifier = new DiscordNotifier();
  }

  /**
   * Start the bot
   */
  async start(): Promise<void> {
    if (!validateConfig()) {
      console.error('Configuration validation failed. Please check your .env file.');
      process.exit(1);
    }

    console.log('🚀 Boom Bot starting...');
    console.log(`📡 Monitoring Pump.fun API: ${config.pumpfunApiUrl}`);
    console.log(`⏱️  Poll interval: ${config.pollInterval / 1000}s`);
    console.log(`🎯 Min volume threshold: $${config.minVolumeThreshold}`);
    console.log(`💧 Min liquidity threshold: $${config.minLiquidityThreshold}`);
    console.log(`👥 Min holder count: ${config.minHolderCount}`);
    console.log('');

    this.isRunning = true;

    // Run initial scan
    await this.scan();

    // Set up polling interval
    const intervalId = setInterval(async () => {
      if (this.isRunning) {
        await this.scan();
      }
    }, config.pollInterval);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down Boom Bot...');
      this.isRunning = false;
      clearInterval(intervalId);
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down Boom Bot...');
      this.isRunning = false;
      clearInterval(intervalId);
      process.exit(0);
    });
  }

  /**
   * Scan for new coins and send alerts
   */
  private async scan(): Promise<void> {
    try {
      console.log(`🔍 Scanning for new coins... [${new Date().toLocaleTimeString()}]`);

      // Fetch recent coins from Pump.fun
      const coins = await this.pumpFunClient.fetchRecentCoins();
      
      if (coins.length === 0) {
        console.log('No coins found in current scan.');
        return;
      }

      // Filter for new coins we haven't seen before
      const newCoins = this.pumpFunClient.filterNewCoins(coins);
      
      if (newCoins.length === 0) {
        console.log('No new coins detected.');
        return;
      }

      console.log(`📊 Found ${newCoins.length} new coin(s)`);

      // Process each new coin
      for (const coin of newCoins) {
        // Check if coin meets minimum thresholds
        if (!this.pumpFunClient.meetsThresholds(coin)) {
          console.log(`⏭️  Skipping ${coin.symbol} - below thresholds`);
          continue;
        }

        // Calculate trend score
        const trendScore = this.trendAnalyzer.calculateTrendScore(coin);

        console.log(`📈 ${coin.name} (${coin.symbol}) - Score: ${trendScore.score}/100`);

        // Check if should alert
        if (this.trendAnalyzer.shouldAlert(trendScore)) {
          const alertData: AlertData = {
            coin,
            trendScore,
            timestamp: Date.now(),
          };

          await this.discordNotifier.sendAlert(alertData);
        } else {
          console.log(`   Score too low, no alert sent.`);
        }
      }

      console.log('✅ Scan complete\n');
    } catch (error) {
      console.error('Error during scan:', error);
    }
  }
}

// Entry point
const bot = new BoomBot();
bot.start().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
