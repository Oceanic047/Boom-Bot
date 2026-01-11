# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install
```bash
git clone https://github.com/Oceanic047/Boom-Bot.git
cd Boom-Bot
npm install
```

### 2. Configure
```bash
cp .env.example .env
```

Edit `.env` and set your Discord webhook URL:
```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

### 3. Run
```bash
npm run build
npm start
```

## 🎯 What It Does

- **Monitors**: Checks Pump.fun API every 60 seconds for new meme coins
- **Analyzes**: Calculates a 0-100 trend score based on:
  - Volume (40%)
  - Liquidity (30%)
  - Holders (20%)
  - Age (10%)
- **Alerts**: Posts to Discord when score ≥ 50

## 📊 Score Guide

| Score | Color  | Meaning |
|-------|--------|---------|
| 80-100 | 🟢 Green | 🔥🔥🔥 Hot opportunity |
| 60-79  | 🟡 Yellow | 🔥🔥 Warm interest |
| 40-59  | 🟠 Orange | 🔥 Moderate activity |
| 0-39   | 🔴 Red | Low activity |

## ⚙️ Key Settings

```env
POLL_INTERVAL=60                  # Check every 60 seconds
ALERT_SCORE_THRESHOLD=50          # Alert when score ≥ 50
MIN_VOLUME_THRESHOLD=1000         # Minimum $1,000 volume
MIN_LIQUIDITY_THRESHOLD=5000      # Minimum $5,000 liquidity
MIN_HOLDER_COUNT=10               # Minimum 10 holders
```

## 🎨 Discord Alert Example

```
🚀 Doge to the Moon (DTMOON)
The ultimate meme coin for space enthusiasts! 🚀🌕

📊 Trend Score: **78/100** 🔥🔥
⏰ Age: 40m
👥 Holders: 234

💰 24h Volume: $125.00K
💧 Liquidity: $75.00K
📈 Market Cap: $850.00K

🔍 Score Breakdown
Volume: 72 | Liquidity: 68 | Holders: 85 | Age: 93

🔗 Contract Address
`FxVpjJ76SqPDhXkYLMCw6zQ8S8gTqKvQMm2YSg5pump`
```

## 🔧 Troubleshooting

**Bot not sending alerts?**
- Check Discord webhook URL is correct
- Verify coins meet minimum thresholds
- Ensure trend scores are ≥ 50

**No coins detected?**
- Pump.fun API may be rate limiting
- Check internet connection
- Verify API endpoint is accessible

## 📚 More Info

See [README.md](README.md) for full documentation.
