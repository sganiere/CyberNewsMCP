import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { CyberSecurityFeed, FeedItem, ParsedFeed } from './types.js';
import { SecurityUtils } from './security-utils.js';

export class RSSFeedParser {
  private parser: Parser;

  constructor() {
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'CyberSecurity-RSS-MCP-Server/1.0'
      }
    });
  }

  async parseFeed(feed: CyberSecurityFeed): Promise<ParsedFeed> {
    try {
      // Validate URL for SSRF protection
      const urlValidation = SecurityUtils.validateUrl(feed.url);
      if (!urlValidation.isValid) {
        throw new Error(`Invalid feed URL: ${urlValidation.error}`);
      }

      const parsedFeed = await this.parser.parseURL(feed.url);
      
      const items: FeedItem[] = parsedFeed.items.map(item => ({
        title: SecurityUtils.sanitizeText(item.title || 'Untitled', 200),
        link: item.link || '',
        pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
        description: this.sanitizeContent(item.contentSnippet || item.content || ''),
        content: item.content ? this.sanitizeContent(item.content) : undefined,
        author: item.creator || item['dc:creator'] || undefined,
        categories: item.categories || [],
        guid: item.guid || item.link
      }));

      return {
        title: parsedFeed.title || feed.name,
        description: parsedFeed.description || feed.description,
        link: parsedFeed.link || feed.url,
        lastUpdated: parsedFeed.lastBuildDate ? new Date(parsedFeed.lastBuildDate) : new Date(),
        items: items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
      };
    } catch (error) {
      throw new Error(`Failed to parse feed ${feed.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async parseMultipleFeeds(feeds: CyberSecurityFeed[]): Promise<Map<string, ParsedFeed>> {
    const results = new Map<string, ParsedFeed>();
    
    const parsePromises = feeds.map(async (feed) => {
      try {
        const parsedFeed = await this.parseFeed(feed);
        results.set(feed.name, parsedFeed);
      } catch (error) {
        console.error(`Error parsing feed ${feed.name}:`, error);
      }
    });

    await Promise.allSettled(parsePromises);
    return results;
  }

  async fetchFullArticle(url: string): Promise<string | null> {
    try {
      // Validate URL for SSRF protection
      const urlValidation = SecurityUtils.validateUrl(url);
      if (!urlValidation.isValid) {
        console.warn(`Blocked potentially malicious URL: ${url}`);
        return null;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CyberSecurity-RSS-MCP-Server/1.0'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Remove unwanted elements
      $('script, style, nav, header, footer, aside, .advertisement, .ads').remove();
      
      // Try to find the main content using common selectors
      const contentSelectors = [
        'article',
        '.post-content',
        '.entry-content',
        '.content',
        '.post-body',
        '[role="main"]',
        'main'
      ];

      let content = '';
      for (const selector of contentSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          content = element.text().trim();
          if (content.length > 200) { // Ensure we have substantial content
            break;
          }
        }
      }

      // Fallback to body if no specific content found
      if (!content || content.length < 200) {
        content = $('body').text().trim();
      }

      return this.sanitizeContent(content);
    } catch (error) {
      console.error(`Error fetching full article from ${url}:`, error);
      return null;
    }
  }

  private sanitizeContent(content: string): string {
    // Remove HTML tags and decode entities
    const $ = cheerio.load(content);
    let text = $.text();
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    // Remove common unwanted patterns
    text = text.replace(/\[…\]/g, '...');
    text = text.replace(/Continue reading.*/gi, '');
    text = text.replace(/Read more.*/gi, '');
    
    return text;
  }
}