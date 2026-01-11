import { Client, GatewayIntentBits, EmbedBuilder, TextChannel } from 'discord.js';
import { config } from './config';
import { AlertData } from './types';

export class DiscordNotifier {
  private client: Client;
  private channelId: string;
  private isReady: boolean = false;

  constructor() {
    this.channelId = config.discordChannelId;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
      ],
    });

    this.client.on('ready', () => {
      console.log(`✅ Discord bot logged in as ${this.client.user?.tag}`);
      this.isReady = true;
    });

    this.client.on('error', (error) => {
      console.error('Discord client error:', error);
    });
  }

  /**
   * Initialize the Discord bot connection
   */
  async connect(): Promise<void> {
    try {
      // Set up the ready listener before logging in to avoid race condition
      const readyPromise = new Promise<void>((resolve) => {
        if (this.isReady) {
          resolve();
        } else {
          this.client.once('ready', () => resolve());
        }
      });

      await this.client.login(config.discordBotToken);
      
      // Wait for the bot to be ready
      await readyPromise;
    } catch (error) {
      console.error('Failed to connect to Discord:', error);
      throw error;
    }
  }

  /**
   * Send an alert to Discord with formatted coin information
   */
  async sendAlert(alertData: AlertData): Promise<boolean> {
    try {
      if (!this.isReady) {
        console.error('Discord bot is not ready yet');
        return false;
      }

      const channel = await this.client.channels.fetch(this.channelId);
      
      if (!channel || !(channel instanceof TextChannel)) {
        console.error('Invalid channel or channel is not a text channel');
        return false;
      }

      const embed = this.formatAlertEmbed(alertData);
      
      await channel.send({ embeds: [embed] });

      console.log(`✅ Alert sent for ${alertData.coin.symbol} (Score: ${alertData.trendScore.score})`);
      return true;
    } catch (error) {
      console.error('Error sending Discord alert:', error);
      return false;
    }
  }

  /**
   * Format coin data into a Discord embed
   */
  private formatAlertEmbed(alertData: AlertData): EmbedBuilder {
    const { coin, trendScore } = alertData;
    
    // Determine color based on trend score
    const color = this.getColorForScore(trendScore.score);
    
    // Format age
    const ageFormatted = this.formatAge(coin.age);
    
    // Format numbers
    const volumeFormatted = this.formatNumber(coin.volume24h);
    const liquidityFormatted = this.formatNumber(coin.liquidity);
    const marketCapFormatted = this.formatNumber(coin.marketCap || 0);
    
    const embed = new EmbedBuilder()
      .setTitle(`🚀 ${coin.name} (${coin.symbol})`)
      .setDescription(coin.description || 'New meme coin detected!')
      .setColor(color)
      .addFields(
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
        }
      )
      .setFooter({ text: 'Boom Bot - Pump.fun Monitor' })
      .setTimestamp(new Date(alertData.timestamp));

    if (coin.image_uri) {
      embed.setThumbnail(coin.image_uri);
    }

    return embed;
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

  /**
   * Disconnect the Discord bot
   */
  async disconnect(): Promise<void> {
    await this.client.destroy();
    this.isReady = false;
  }
}
