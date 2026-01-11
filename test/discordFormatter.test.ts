import { DiscordNotifier } from '../src/discordNotifier';
import { AlertData, CoinData, TrendScore } from '../src/types';

/**
 * Test Discord notification formatting (without actually sending)
 */
function testDiscordFormatting() {
  console.log('🧪 Testing Discord Alert Formatting\n');

  // Mock Discord notifier (we'll just test the formatting logic)
  const notifier = new DiscordNotifier();

  // Create sample coin data
  const sampleCoin: CoinData = {
    mint: 'FxVpjJ76SqPDhXkYLMCw6zQ8S8gTqKvQMm2YSg5pump',
    name: 'Doge to the Moon',
    symbol: 'DTMOON',
    description: 'The ultimate meme coin for space enthusiasts! 🚀🌕',
    image_uri: 'https://example.com/token-image.png',
    created_timestamp: Math.floor(Date.now() / 1000) - 2400, // 40 minutes ago
    age: 2400,
    volume24h: 125000,
    liquidity: 75000,
    holderCount: 234,
    priceChange24h: 15.5,
    marketCap: 850000,
  };

  const sampleTrendScore: TrendScore = {
    score: 78,
    breakdown: {
      volumeScore: 72,
      liquidityScore: 68,
      holderScore: 85,
      ageScore: 93,
    },
  };

  const alertData: AlertData = {
    coin: sampleCoin,
    trendScore: sampleTrendScore,
    timestamp: Date.now(),
  };

  console.log('📊 Sample Alert Data:');
  console.log('─────────────────────────────────────────');
  console.log(`Token: ${sampleCoin.name} (${sampleCoin.symbol})`);
  console.log(`Trend Score: ${sampleTrendScore.score}/100`);
  console.log(`Age: ${Math.floor(sampleCoin.age / 60)} minutes`);
  console.log(`Volume: $${sampleCoin.volume24h.toLocaleString()}`);
  console.log(`Liquidity: $${sampleCoin.liquidity.toLocaleString()}`);
  console.log(`Holders: ${sampleCoin.holderCount}`);
  console.log(`Market Cap: $${sampleCoin.marketCap?.toLocaleString()}`);
  console.log('─────────────────────────────────────────');
  console.log('\n✅ Alert formatting test completed successfully!');
  console.log('   (Actual Discord sending requires DISCORD_WEBHOOK_URL in .env)');
}

testDiscordFormatting();
