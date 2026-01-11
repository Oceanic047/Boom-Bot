# Boom-Bot 🚀

A sophisticated Discord bot that monitors meme coin launches via the Pump.fun API, analyzes market signals, and posts real-time alerts with comprehensive trend scoring.

## Features

✨ **Real-time Monitoring**: Continuously tracks new meme coin launches on Pump.fun  
📊 **Signal Analysis**: Analyzes volume growth, liquidity, holder count, and coin age  
🎯 **Trend Scoring**: Calculates a 0-100 trend score based on weighted metrics  
🔔 **Discord Alerts**: Posts formatted alerts with token stats and visual indicators  
⚙️ **Configurable**: Customizable thresholds and scoring weights

## How It Works

1. **Fetch**: Polls the Pump.fun API at regular intervals for new coin launches
2. **Track**: Records metadata including name, symbol, creation time, and age
3. **Analyze**: Evaluates market signals:
   - 24-hour trading volume
   - Available liquidity
   - Number of token holders
   - Time since launch
4. **Score**: Calculates a trend score (0-100) using weighted metrics:
   - Volume Growth (40%)
   - Liquidity (30%)
   - Holder Count (20%)
   - Age Factor (10%)
5. **Alert**: Posts Discord notifications for coins with scores ≥50

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Discord bot token and channel ID

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Oceanic047/Boom-Bot.git
cd Boom-Bot
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` and add your Discord bot token and channel ID:
```env
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CHANNEL_ID=your_channel_id_here
```

### How to Get Discord Bot Token and Channel ID

1. **Create a Discord Bot**:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application" and give it a name
   - Go to the "Bot" tab and click "Add Bot"
   - Under the bot's token section, click "Reset Token" and copy it (this is your `DISCORD_BOT_TOKEN`)
   - Enable these Privileged Gateway Intents:
     - Server Members Intent (optional)
     - Message Content Intent (optional)

2. **Invite Bot to Your Server**:
   - Go to the "OAuth2" > "URL Generator" tab
   - Select scopes: `bot`
   - Select bot permissions: `Send Messages`, `Embed Links`, `Read Messages/View Channels`
   - Copy the generated URL and open it in your browser to invite the bot to your server

3. **Get Channel ID**:
   - Enable Developer Mode in Discord: User Settings > Advanced > Developer Mode
   - Right-click on the channel where you want alerts and click "Copy ID" (this is your `DISCORD_CHANNEL_ID`)

## Configuration

Edit `.env` to customize bot behavior:

```env
# Discord Bot (Required)
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CHANNEL_ID=your_channel_id_here

# API Endpoint
PUMPFUN_API_URL=https://frontend-api.pump.fun/coins

# Polling interval in seconds
POLL_INTERVAL=60

# Minimum thresholds for alerts
MIN_VOLUME_THRESHOLD=1000        # Minimum 24h volume in USD
MIN_LIQUIDITY_THRESHOLD=5000     # Minimum liquidity in USD
MIN_HOLDER_COUNT=10              # Minimum number of holders

# Scoring weights (should sum to 1.0)
VOLUME_GROWTH_WEIGHT=0.4
LIQUIDITY_WEIGHT=0.3
HOLDER_WEIGHT=0.2
AGE_WEIGHT=0.1
```

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### Running as a Service

For continuous operation, consider using PM2:

```bash
npm install -g pm2
pm2 start dist/index.js --name boom-bot
pm2 save
pm2 startup
```

## Trend Score Calculation

The trend score (0-100) is calculated using a weighted formula:

```
Score = (Volume Score × 0.4) + (Liquidity Score × 0.3) + 
        (Holder Score × 0.2) + (Age Score × 0.1)
```

### Score Components

- **Volume Score**: Logarithmic scale based on 24h trading volume
- **Liquidity Score**: Logarithmic scale based on available liquidity
- **Holder Score**: Logarithmic scale based on number of holders
- **Age Score**: Time-based bonus for newly launched coins:
  - < 1 hour: 80-100 points (very fresh)
  - 1-6 hours: 60-80 points (recent)
  - 6-24 hours: 20-60 points (moderate)
  - > 24 hours: 0-20 points (older)

## Discord Alert Format

Alerts include:
- 🚀 Coin name and symbol
- 📊 Trend score with visual indicators (🔥🔥🔥 for hot coins)
- ⏰ Time since launch
- 👥 Holder count
- 💰 24-hour volume
- 💧 Liquidity amount
- 📈 Market cap
- 🔍 Score breakdown
- 🔗 Contract address

Color coding:
- 🟢 Green (80-100): Hot opportunity
- 🟡 Yellow (60-79): Warm interest
- 🟠 Orange (40-59): Moderate activity
- 🔴 Red (0-39): Low activity

## Project Structure

```
Boom-Bot/
├── src/
│   ├── index.ts              # Main entry point
│   ├── config.ts             # Configuration management
│   ├── types.ts              # TypeScript type definitions
│   ├── pumpfunClient.ts      # Pump.fun API client
│   ├── trendAnalyzer.ts      # Trend scoring algorithm
│   └── discordNotifier.ts    # Discord bot integration
├── dist/                     # Compiled JavaScript (generated)
├── .env                      # Environment variables (create from .env.example)
├── .env.example              # Example environment configuration
├── package.json              # Project dependencies
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## Development

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Troubleshooting

### Bot not starting

- Ensure `DISCORD_BOT_TOKEN` and `DISCORD_CHANNEL_ID` are set in `.env`
- Check Node.js version (requires 18+)
- Verify dependencies are installed: `npm install`
- Verify bot has been invited to your server
- Verify bot has permissions to send messages in the channel

### No alerts appearing

- Check bot token and channel ID are valid
- Verify coins meet minimum thresholds
- Ensure trend scores are ≥50
- Check bot has permission to view and send messages in the channel
- Verify the bot is online in your Discord server

### API errors

- Pump.fun API may have rate limits
- Check internet connectivity
- Verify API endpoint URL is correct

## License

MIT License - See LICENSE file for details

## Disclaimer

This bot is for educational and informational purposes only. Cryptocurrency investments are highly risky. Always do your own research (DYOR) before making any investment decisions. The developers are not responsible for any financial losses.