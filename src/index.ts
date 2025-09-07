#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { CYBERSECURITY_FEEDS, getFeedByName, getFeedsByCategory } from './feeds.js';
import { RSSFeedParser } from './rss-parser.js';
import { FeedSearcher } from './feed-searcher.js';
import { ContentSummarizer } from './content-summarizer.js';
import { CyberSecurityFeed, FeedItem, SearchOptions } from './types.js';
import { SecurityUtils } from './security-utils.js';

interface ListFeedsArgs {
  category?: CyberSecurityFeed['category'];
}

interface FetchFeedArgs {
  feedName: string;
  maxItems?: number;
}

interface FetchMultipleFeedsArgs {
  feedNames?: string[];
  category?: CyberSecurityFeed['category'];
  maxItemsPerFeed?: number;
}

interface SearchByKeywordsArgs {
  keywords: string[];
  category?: CyberSecurityFeed['category'];
  dateFrom?: string;
  dateTo?: string;
  maxResults?: number;
}

interface GetTrendingTopicsArgs {
  daysBack?: number;
  minMentions?: number;
  maxTopics?: number;
}

interface GetNewsBriefsArgs {
  category?: CyberSecurityFeed['category'];
  dateFrom?: string;
  dateTo?: string;
  maxBriefs?: number;
}

class CyberSecurityRSSServer {
  private server: Server;
  private rssParser: RSSFeedParser;
  private feedSearcher: FeedSearcher;
  private contentSummarizer: ContentSummarizer;
  private feedCache: Map<string, { data: FeedItem[]; lastUpdated: Date }>;

  constructor() {
    this.server = new Server(
      {
        name: 'cybersecurity-rss-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.rssParser = new RSSFeedParser();
    this.feedSearcher = new FeedSearcher();
    this.contentSummarizer = new ContentSummarizer();
    this.feedCache = new Map();

    this.setupToolHandlers();
    
    // Log initialization for debugging
    this.server.onerror = (error) => {
      console.error('[MCP Server Error]', error);
    };
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_feeds',
            description: 'List all available cybersecurity RSS feeds with their details',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  description: 'Filter feeds by category: news, threat-intelligence, vulnerabilities, or research'
                }
              },
              additionalProperties: false
            }
          },
          {
            name: 'fetch_feed',
            description: 'Fetch and parse a specific cybersecurity RSS feed',
            inputSchema: {
              type: 'object',
              properties: {
                feedName: {
                  type: 'string',
                  description: 'Name of the feed to fetch (partial match supported)'
                },
                maxItems: {
                  type: 'number',
                  description: 'Maximum number of items to return (default: 20)'
                }
              },
              required: ['feedName'],
              additionalProperties: false
            }
          },
          {
            name: 'fetch_multiple_feeds',
            description: 'Fetch content from multiple cybersecurity RSS feeds simultaneously',
            inputSchema: {
              type: 'object',
              properties: {
                feedNames: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of feed names to fetch'
                },
                category: {
                  type: 'string',
                  description: 'Fetch all feeds from a specific category: news, threat-intelligence, vulnerabilities, or research'
                },
                maxItemsPerFeed: {
                  type: 'number',
                  description: 'Maximum items per feed (default: 10)'
                }
              },
              additionalProperties: false
            }
          },
          {
            name: 'search_by_keywords',
            description: 'Search across all feeds using keywords with advanced filtering',
            inputSchema: {
              type: 'object',
              properties: {
                keywords: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Keywords to search for'
                },
                category: {
                  type: 'string',
                  description: 'Filter by feed category: news, threat-intelligence, vulnerabilities, or research'
                },
                dateFrom: {
                  type: 'string',
                  description: 'Start date for filtering (YYYY-MM-DD format)'
                },
                dateTo: {
                  type: 'string',
                  description: 'End date for filtering (YYYY-MM-DD format)'
                },
                maxResults: {
                  type: 'number',
                  description: 'Maximum number of results (default: 50)'
                }
              },
              required: ['keywords'],
              additionalProperties: false
            }
          },
          {
            name: 'get_trending_topics',
            description: 'Extract trending cybersecurity topics from recent feed content',
            inputSchema: {
              type: 'object',
              properties: {
                daysBack: {
                  type: 'number',
                  description: 'Number of days to look back (default: 7)'
                },
                minMentions: {
                  type: 'number',
                  description: 'Minimum mentions required for trending topic (default: 5)'
                },
                maxTopics: {
                  type: 'number',
                  description: 'Maximum number of topics to return (default: 10)'
                }
              },
              additionalProperties: false
            }
          },
          {
            name: 'get_news_briefs',
            description: 'Generate concise news summaries (100-125 words) with source links',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  description: 'Filter by category: news, threat-intelligence, vulnerabilities, or research'
                },
                dateFrom: {
                  type: 'string',
                  description: 'Start date for filtering (YYYY-MM-DD format)'
                },
                dateTo: {
                  type: 'string',
                  description: 'End date for filtering (YYYY-MM-DD format)'
                },
                maxBriefs: {
                  type: 'number',
                  description: 'Maximum number of briefs (default: 10)'
                }
              },
              additionalProperties: false
            }
          }
        ] satisfies Tool[]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_feeds':
            return this.handleListFeeds(args as unknown as ListFeedsArgs);
          
          case 'fetch_feed':
            return this.handleFetchFeed(args as unknown as FetchFeedArgs);
          
          case 'fetch_multiple_feeds':
            return this.handleFetchMultipleFeeds(args as unknown as FetchMultipleFeedsArgs);
          
          case 'search_by_keywords':
            return this.handleSearchByKeywords(args as unknown as SearchByKeywordsArgs);
          
          case 'get_trending_topics':
            return this.handleGetTrendingTopics(args as unknown as GetTrendingTopicsArgs);
          
          case 'get_news_briefs':
            return this.handleGetNewsBriefs(args as unknown as GetNewsBriefsArgs);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        // Log the error securely (without sensitive data)
        this.logSecurely('error', `MCP Server Error in ${name}`, error);
        
        const sanitizedMessage = this.sanitizeErrorMessage(error, name);
        
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${sanitizedMessage}`
            }
          ]
        };
      }
    });
  }

  private sanitizeErrorMessage(error: unknown, toolName: string): string {
    // Provide generic error messages to prevent information disclosure
    const genericErrors: Record<string, string> = {
      'list_feeds': 'Failed to retrieve feed list. Please try again.',
      'fetch_feed': 'Failed to fetch feed content. The feed may be temporarily unavailable.',
      'fetch_multiple_feeds': 'Failed to fetch some feeds. Some sources may be temporarily unavailable.',
      'search_by_keywords': 'Search operation failed. Please check your search parameters.',
      'get_trending_topics': 'Failed to analyze trending topics. Please try again later.',
      'get_news_briefs': 'Failed to generate news briefs. Please try again later.'
    };

    // Check for specific safe error types that can be shown to user
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // Feed not found errors are safe to show
      if (message.includes('feed not found')) {
        return error.message;
      }
      
      // Invalid input errors are safe to show
      if (message.includes('invalid') && (
        message.includes('keyword') ||
        message.includes('parameter') ||
        message.includes('date') ||
        message.includes('category')
      )) {
        return error.message;
      }
      
      // URL validation errors are safe to show
      if (message.includes('invalid feed url') || message.includes('invalid url format')) {
        return 'Invalid feed URL provided.';
      }
    }

    // Return generic error message for security
    return genericErrors[toolName] || 'An unexpected error occurred. Please try again.';
  }

  private logSecurely(level: 'info' | 'warn' | 'error', message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    const logData: Record<string, unknown> = {
      timestamp,
      level,
      message
    };

    // Only include sanitized error information
    if (data instanceof Error) {
      logData.errorType = data.constructor.name;
      logData.errorMessage = data.message.substring(0, 200); // Limit message length
      // Don't include stack traces in production logs for security
      if (process.env.NODE_ENV !== 'production') {
        logData.stack = data.stack;
      }
    } else if (data && typeof data === 'object') {
      // Sanitize object data to prevent logging sensitive information
      logData.data = this.sanitizeLogData(data);
    }

    // Use appropriate log level
    switch (level) {
      case 'error':
        console.error(JSON.stringify(logData));
        break;
      case 'warn':
        console.warn(JSON.stringify(logData));
        break;
      case 'info':
        console.log(JSON.stringify(logData));
        break;
    }
  }

  private sanitizeLogData(data: unknown): unknown {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // Remove sensitive fields that might contain URLs, tokens, etc.
    const sensitiveFields = ['url', 'password', 'token', 'key', 'secret', 'auth'];
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'string' && value.length > 100) {
        sanitized[key] = value.substring(0, 100) + '...';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private async handleListFeeds(args: ListFeedsArgs) {
    const category = args?.category;
    
    let feeds = CYBERSECURITY_FEEDS;
    if (category) {
      feeds = getFeedsByCategory(category);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            totalFeeds: feeds.length,
            feeds: feeds.map(feed => ({
              name: feed.name,
              description: feed.description,
              category: feed.category,
              url: feed.url
            }))
          }, null, 2)
        }
      ]
    };
  }

  private async handleFetchFeed(args: FetchFeedArgs) {
    // Validate feedName
    if (!args.feedName || typeof args.feedName !== 'string') {
      throw new Error('Feed name is required and must be a string.');
    }
    
    const feedName = SecurityUtils.sanitizeText(args.feedName.trim(), 100);
    if (feedName.length === 0) {
      throw new Error('Feed name cannot be empty.');
    }

    // Validate maxItems
    const maxItemsValidation = SecurityUtils.validateNumber(args.maxItems || 20, 1, 100);
    if (!maxItemsValidation.isValid) {
      throw new Error(`Invalid maxItems: ${maxItemsValidation.error}`);
    }
    const maxItems = args.maxItems || 20;

    const feed = getFeedByName(feedName);
    if (!feed) {
      throw new Error(`Feed not found: ${feedName}`);
    }

    const parsedFeed = await this.rssParser.parseFeed(feed);
    const items = parsedFeed.items.slice(0, maxItems);

    // Update cache
    this.feedCache.set(feed.name, {
      data: parsedFeed.items,
      lastUpdated: new Date()
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            feed: {
              name: feed.name,
              title: parsedFeed.title,
              description: parsedFeed.description,
              category: feed.category,
              lastUpdated: parsedFeed.lastUpdated
            },
            itemCount: items.length,
            items: items.map(item => ({
              title: item.title,
              link: item.link,
              pubDate: item.pubDate,
              description: item.description.substring(0, 300) + (item.description.length > 300 ? '...' : ''),
              author: item.author,
              categories: item.categories
            }))
          }, null, 2)
        }
      ]
    };
  }

  private async handleFetchMultipleFeeds(args: FetchMultipleFeedsArgs) {
    const feedNames = args.feedNames;
    const category = args.category;
    const maxItemsPerFeed = args.maxItemsPerFeed || 10;

    let feedsToFetch: CyberSecurityFeed[];

    if (feedNames && feedNames.length > 0) {
      feedsToFetch = feedNames.map(name => {
        const feed = getFeedByName(name);
        if (!feed) throw new Error(`Feed not found: ${name}`);
        return feed;
      });
    } else if (category) {
      feedsToFetch = getFeedsByCategory(category);
    } else {
      feedsToFetch = CYBERSECURITY_FEEDS;
    }

    const results = await this.rssParser.parseMultipleFeeds(feedsToFetch);
    const response: { totalFeeds: number; feeds: Record<string, unknown> } = {
      totalFeeds: results.size,
      feeds: {}
    };

    for (const [feedName, parsedFeed] of results.entries()) {
      const items = parsedFeed.items.slice(0, maxItemsPerFeed);
      
      // Update cache
      this.feedCache.set(feedName, {
        data: parsedFeed.items,
        lastUpdated: new Date()
      });

      response.feeds[feedName] = {
        title: parsedFeed.title,
        itemCount: items.length,
        lastUpdated: parsedFeed.lastUpdated,
        items: items.map(item => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          description: item.description.substring(0, 200) + (item.description.length > 200 ? '...' : '')
        }))
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }
      ]
    };
  }

  private async handleSearchByKeywords(args: SearchByKeywordsArgs) {
    // Validate keywords
    const keywordValidation = SecurityUtils.validateKeywords(args.keywords || []);
    if (!keywordValidation.isValid) {
      throw new Error(keywordValidation.error);
    }
    const keywords = keywordValidation.sanitized;

    const category = args.category;

    // Validate date inputs
    let dateFrom: Date | undefined;
    let dateTo: Date | undefined;

    if (args.dateFrom) {
      const dateFromValidation = SecurityUtils.validateDate(args.dateFrom);
      if (!dateFromValidation.isValid) {
        throw new Error(`Invalid dateFrom: ${dateFromValidation.error}`);
      }
      dateFrom = dateFromValidation.date;
    }

    if (args.dateTo) {
      const dateToValidation = SecurityUtils.validateDate(args.dateTo);
      if (!dateToValidation.isValid) {
        throw new Error(`Invalid dateTo: ${dateToValidation.error}`);
      }
      dateTo = dateToValidation.date;
    }

    // Validate maxResults
    const maxResultsValidation = SecurityUtils.validateNumber(args.maxResults || 50, 1, 200);
    if (!maxResultsValidation.isValid) {
      throw new Error(`Invalid maxResults: ${maxResultsValidation.error}`);
    }
    const maxResults = args.maxResults || 50;

    // Ensure we have fresh data
    await this.refreshFeedData();

    const searchOptions: SearchOptions = {
      keywords,
      category,
      dateFrom,
      dateTo,
      maxResults
    };

    const feedData = new Map();
    for (const [feedName, cached] of this.feedCache.entries()) {
      const feed = getFeedByName(feedName);
      if (feed) {
        feedData.set(feedName, { feed, items: cached.data });
      }
    }

    const results = this.feedSearcher.searchFeeds(feedData, searchOptions);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            searchQuery: { keywords, category, dateFrom, dateTo },
            resultCount: results.length,
            results: results.map(result => ({
              title: result.item.title,
              link: result.item.link,
              pubDate: result.item.pubDate,
              description: result.item.description.substring(0, 250) + (result.item.description.length > 250 ? '...' : ''),
              source: result.feedName,
              relevanceScore: Math.round(result.relevanceScore * 100) / 100
            }))
          }, null, 2)
        }
      ]
    };
  }

  private async handleGetTrendingTopics(args: GetTrendingTopicsArgs) {
    // Validate daysBack
    const daysBackValidation = SecurityUtils.validateNumber(args.daysBack || 7, 1, 90);
    if (!daysBackValidation.isValid) {
      throw new Error(`Invalid daysBack: ${daysBackValidation.error}`);
    }
    const daysBack = args.daysBack || 7;

    // Validate minMentions
    const minMentionsValidation = SecurityUtils.validateNumber(args.minMentions || 5, 1, 50);
    if (!minMentionsValidation.isValid) {
      throw new Error(`Invalid minMentions: ${minMentionsValidation.error}`);
    }
    const minMentions = args.minMentions || 5;

    // Validate maxTopics
    const maxTopicsValidation = SecurityUtils.validateNumber(args.maxTopics || 10, 1, 50);
    if (!maxTopicsValidation.isValid) {
      throw new Error(`Invalid maxTopics: ${maxTopicsValidation.error}`);
    }
    const maxTopics = args.maxTopics || 10;

    await this.refreshFeedData();

    // Collect recent items from all feeds
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const recentItems: FeedItem[] = [];
    for (const cached of this.feedCache.values()) {
      const filtered = cached.data.filter(item => item.pubDate >= cutoffDate);
      recentItems.push(...filtered);
    }

    const trendingTopics = this.contentSummarizer.extractTrendingTopics(recentItems, minMentions);
    const limitedTopics = trendingTopics.slice(0, maxTopics);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            analysisInfo: {
              daysAnalyzed: daysBack,
              totalItems: recentItems.length,
              minMentions
            },
            trendingTopics: limitedTopics.map(topic => ({
              topic: topic.topic,
              mentions: topic.mentions,
              category: topic.category,
              relatedArticles: topic.relatedItems.slice(0, 3).map(item => ({
                title: item.title,
                link: item.link,
                pubDate: item.pubDate
              }))
            }))
          }, null, 2)
        }
      ]
    };
  }

  private async handleGetNewsBriefs(args: GetNewsBriefsArgs) {
    const category = args.category;

    // Validate date inputs
    let dateFrom: Date | undefined;
    let dateTo: Date | undefined;

    if (args.dateFrom) {
      const dateFromValidation = SecurityUtils.validateDate(args.dateFrom);
      if (!dateFromValidation.isValid) {
        throw new Error(`Invalid dateFrom: ${dateFromValidation.error}`);
      }
      dateFrom = dateFromValidation.date;
    }

    if (args.dateTo) {
      const dateToValidation = SecurityUtils.validateDate(args.dateTo);
      if (!dateToValidation.isValid) {
        throw new Error(`Invalid dateTo: ${dateToValidation.error}`);
      }
      dateTo = dateToValidation.date;
    }

    // Validate maxBriefs
    const maxBriefsValidation = SecurityUtils.validateNumber(args.maxBriefs || 10, 1, 50);
    if (!maxBriefsValidation.isValid) {
      throw new Error(`Invalid maxBriefs: ${maxBriefsValidation.error}`);
    }
    const maxBriefs = args.maxBriefs || 10;

    await this.refreshFeedData();

    // Collect items from relevant feeds
    const allItems: Array<{ item: FeedItem; feedName: string }> = [];
    
    for (const [feedName, cached] of this.feedCache.entries()) {
      const feed = getFeedByName(feedName);
      if (feed && (!category || feed.category === category)) {
        const filteredItems = cached.data.filter(item => {
          if (dateFrom && item.pubDate < dateFrom) return false;
          if (dateTo && item.pubDate > dateTo) return false;
          return true;
        });
        
        for (const item of filteredItems) {
          allItems.push({ item, feedName });
        }
      }
    }

    // Sort by date (newest first) and limit
    allItems.sort((a, b) => b.item.pubDate.getTime() - a.item.pubDate.getTime());
    const selectedItems = allItems.slice(0, maxBriefs);

    const briefs = selectedItems.map(({ item, feedName }) => 
      this.contentSummarizer.generateNewsBrief(item, feedName)
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            briefsInfo: {
              dateRange: { from: dateFrom, to: dateTo },
              category,
              totalBriefs: briefs.length
            },
            briefs: briefs.map(brief => ({
              title: brief.title,
              summary: brief.summary,
              source: brief.source,
              link: brief.link,
              publishedDate: brief.publishedDate,
              category: brief.category
            }))
          }, null, 2)
        }
      ]
    };
  }

  private async refreshFeedData() {
    const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
    const now = new Date();
    
    const feedsToRefresh: CyberSecurityFeed[] = [];
    
    for (const feed of CYBERSECURITY_FEEDS) {
      const cached = this.feedCache.get(feed.name);
      if (!cached || (now.getTime() - cached.lastUpdated.getTime()) > CACHE_DURATION) {
        feedsToRefresh.push(feed);
      }
    }

    if (feedsToRefresh.length > 0) {
      console.error(`Refreshing ${feedsToRefresh.length} feeds...`);
      const results = await this.rssParser.parseMultipleFeeds(feedsToRefresh);
      
      for (const [feedName, parsedFeed] of results.entries()) {
        this.feedCache.set(feedName, {
          data: parsedFeed.items,
          lastUpdated: now
        });
      }
    }
  }

  async run() {
    try {
      console.error('Starting Cybersecurity RSS MCP Server...');
      const transport = new StdioServerTransport();
      
      console.error('Connecting to transport...');
      await this.server.connect(transport);
      
      console.error('Cybersecurity RSS MCP Server running on stdio - ready to accept requests');
    } catch (error) {
      console.error('Failed to start server:', error);
      throw error;
    }
  }
}

// Start the server
const server = new CyberSecurityRSSServer();
server.run().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});