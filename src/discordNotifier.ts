import axios from 'axios';
import { config } from './config';
import { AlertData } from './types';

export class DiscordNotifier {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = config.discordWebhookUrl;
  }

  /**
   * Send an alert to Discord with formatted coin information
   */
  async sendAlert(alertData: AlertData): Promise<boolean> {
    try {
      const embed = this.formatAlertEmbed(alertData);
      
      const payload = {
        username: 'Boom Bot 🚀',
        avatar_url: 'https://i.imgur.com/4M34hi2.png',
        embeds: [embed],
      };

      await axios.post(this.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log(`✅ Alert sent for ${alertData.coin.symbol} (Score: ${alertData.trendScore.score})`);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error sending Discord alert:', error.message);
      } else {
        console.error('Unexpected error sending alert:', error);
      }
      return false;
    }
  }

  /**
   * Format coin data into a Discord embed
   */
  private formatAlertEmbed(alertData: AlertData) {
    const { coin, trendScore } = alertData;
    
    // Determine color based on trend score
    const color = this.getColorForScore(trendScore.score);
    
    // Format age
    const ageFormatted = this.formatAge(coin.age);
    
    // Format numbers
    const volumeFormatted = this.formatNumber(coin.volume24h);
    const liquidityFormatted = this.formatNumber(coin.liquidity);
    const marketCapFormatted = this.formatNumber(coin.marketCap || 0);
    
    return {
      title: `🚀 ${coin.name} (${coin.symbol})`,
      description: coin.description || 'New meme coin detected!',
      color: color,
      fields: [
        {
          name: '📊 Trend Score',
          value: `**${trendScore.score}/100** ${this.getScoreEmoji(trendScore.score)}`,
          inline: true,
        },
        {
          name: '⏰ Age',
          value: ageFormatted,
          inline: true,
        },
        {
          name: '👥 Holders',
          value: coin.holderCount.toString(),
          inline: true,
        },
        {
          name: '💰 24h Volume',
          value: `$${volumeFormatted}`,
          inline: true,
        },
        {
          name: '💧 Liquidity',
          value: `$${liquidityFormatted}`,
          inline: true,
        },
        {
          name: '📈 Market Cap',
          value: `$${marketCapFormatted}`,
          inline: true,
        },
        {
          name: '🔍 Score Breakdown',
          value: [
            `Volume: ${trendScore.breakdown.volumeScore}`,
            `Liquidity: ${trendScore.breakdown.liquidityScore}`,
            `Holders: ${trendScore.breakdown.holderScore}`,
            `Age: ${trendScore.breakdown.ageScore}`,
          ].join(' | '),
          inline: false,
        },
        {
          name: '🔗 Contract Address',
          value: `\`${coin.mint}\``,
          inline: false,
        },
      ],
      thumbnail: coin.image_uri ? { url: coin.image_uri } : undefined,
      footer: {
        text: 'Boom Bot - Pump.fun Monitor',
      },
      timestamp: new Date(alertData.timestamp).toISOString(),
    };
  }

  /**
   * Get color based on trend score
   */
  private getColorForScore(score: number): number {
    if (score >= 80) return 0x00ff00; // Green - Hot
    if (score >= 60) return 0xffff00; // Yellow - Warm
    if (score >= 40) return 0xffa500; // Orange - Moderate
    return 0xff0000; // Red - Low
  }

  /**
   * Get emoji based on trend score
   */
  private getScoreEmoji(score: number): string {
    if (score >= 80) return '🔥🔥🔥';
    if (score >= 60) return '🔥🔥';
    if (score >= 40) return '🔥';
    return '📊';
  }

  /**
   * Format age in human-readable format
   */
  private formatAge(ageInSeconds: number): string {
    const minutes = Math.floor(ageInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${ageInSeconds}s`;
  }

  /**
   * Format large numbers with K, M, B suffixes
   */
  private formatNumber(num: number): string {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(2) + 'B';
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(2) + 'M';
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(2) + 'K';
    }
    return num.toFixed(2);
  }
}
