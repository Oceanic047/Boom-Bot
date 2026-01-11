import { TrendAnalyzer } from '../src/trendAnalyzer';
import { CoinData } from '../src/types';

/**
 * Simple test suite for trend analyzer
 */
function runTests() {
  const analyzer = new TrendAnalyzer();
  let passed = 0;
  let failed = 0;

  console.log('🧪 Running Trend Analyzer Tests\n');

  // Test 1: High-volume new coin should score high
  const highVolumeCoin: CoinData = {
    mint: 'test1',
    name: 'Hot Coin',
    symbol: 'HOT',
    created_timestamp: Math.floor(Date.now() / 1000) - 1800, // 30 minutes old
    age: 1800,
    volume24h: 100000,
    liquidity: 50000,
    holderCount: 150,
  };

  const score1 = analyzer.calculateTrendScore(highVolumeCoin);
  if (score1.score >= 50) {
    console.log('✅ Test 1 PASSED: High-volume new coin scored', score1.score);
    passed++;
  } else {
    console.log('❌ Test 1 FAILED: Expected score >= 50, got', score1.score);
    failed++;
  }

  // Test 2: Low-volume coin should score low
  const lowVolumeCoin: CoinData = {
    mint: 'test2',
    name: 'Cold Coin',
    symbol: 'COLD',
    created_timestamp: Math.floor(Date.now() / 1000) - 86400, // 24 hours old
    age: 86400,
    volume24h: 100,
    liquidity: 500,
    holderCount: 5,
  };

  const score2 = analyzer.calculateTrendScore(lowVolumeCoin);
  if (score2.score < 50) {
    console.log('✅ Test 2 PASSED: Low-volume old coin scored', score2.score);
    passed++;
  } else {
    console.log('❌ Test 2 FAILED: Expected score < 50, got', score2.score);
    failed++;
  }

  // Test 3: Alert threshold test
  const shouldAlert1 = analyzer.shouldAlert(score1);
  if (shouldAlert1) {
    console.log('✅ Test 3 PASSED: High score triggers alert');
    passed++;
  } else {
    console.log('❌ Test 3 FAILED: High score should trigger alert');
    failed++;
  }

  const shouldAlert2 = analyzer.shouldAlert(score2);
  if (!shouldAlert2) {
    console.log('✅ Test 4 PASSED: Low score does not trigger alert');
    passed++;
  } else {
    console.log('❌ Test 4 FAILED: Low score should not trigger alert');
    failed++;
  }

  // Test 5: Score breakdown exists
  if (score1.breakdown.volumeScore > 0 && 
      score1.breakdown.liquidityScore > 0 && 
      score1.breakdown.holderScore > 0 && 
      score1.breakdown.ageScore > 0) {
    console.log('✅ Test 5 PASSED: Score breakdown calculated correctly');
    passed++;
  } else {
    console.log('❌ Test 5 FAILED: Score breakdown incomplete');
    failed++;
  }

  // Test 6: Very fresh coin gets age bonus
  const freshCoin: CoinData = {
    mint: 'test3',
    name: 'Fresh Coin',
    symbol: 'FRESH',
    created_timestamp: Math.floor(Date.now() / 1000) - 300, // 5 minutes old
    age: 300,
    volume24h: 10000,
    liquidity: 10000,
    holderCount: 50,
  };

  const score3 = analyzer.calculateTrendScore(freshCoin);
  if (score3.breakdown.ageScore >= 80) {
    console.log('✅ Test 6 PASSED: Fresh coin gets age bonus, age score:', score3.breakdown.ageScore);
    passed++;
  } else {
    console.log('❌ Test 6 FAILED: Fresh coin should get high age score, got:', score3.breakdown.ageScore);
    failed++;
  }

  // Summary
  console.log('\n📊 Test Summary');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  }
}

runTests();
