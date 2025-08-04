import { FeedItem, SearchOptions, SearchResult, CyberSecurityFeed } from './types.js';

export class FeedSearcher {
  
  searchFeeds(feedData: Map<string, { feed: CyberSecurityFeed; items: FeedItem[] }>, options: SearchOptions): SearchResult[] {
    let allResults: SearchResult[] = [];

    for (const [feedName, data] of feedData.entries()) {
      const { feed, items } = data;
      
      // Filter by category if specified
      if (options.category && feed.category !== options.category) {
        continue;
      }

      // Filter by date range
      const filteredItems = this.filterByDateRange(items, options.dateFrom, options.dateTo);
      
      // Search within filtered items
      const searchResults = this.searchInItems(filteredItems, feedName, options.keywords);
      allResults.push(...searchResults);
    }

    // Sort by relevance score (descending) and then by date (newest first)
    allResults.sort((a, b) => {
      if (a.relevanceScore !== b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return b.item.pubDate.getTime() - a.item.pubDate.getTime();
    });

    // Limit results if specified
    if (options.maxResults && options.maxResults > 0) {
      allResults = allResults.slice(0, options.maxResults);
    }

    return allResults;
  }

  private filterByDateRange(items: FeedItem[], dateFrom?: Date, dateTo?: Date): FeedItem[] {
    return items.filter(item => {
      if (dateFrom && item.pubDate < dateFrom) {
        return false;
      }
      if (dateTo && item.pubDate > dateTo) {
        return false;
      }
      return true;
    });
  }

  private searchInItems(items: FeedItem[], feedName: string, keywords?: string[]): SearchResult[] {
    if (!keywords || keywords.length === 0) {
      // Return all items with base relevance score
      return items.map(item => ({
        item,
        feedName,
        relevanceScore: 1
      }));
    }

    const results: SearchResult[] = [];

    for (const item of items) {
      const relevanceScore = this.calculateRelevanceScore(item, keywords);
      
      if (relevanceScore > 0) {
        results.push({
          item,
          feedName,
          relevanceScore
        });
      }
    }

    return results;
  }

  private calculateRelevanceScore(item: FeedItem, keywords: string[]): number {
    let score = 0;
    const normalizedKeywords = keywords.map(k => k.toLowerCase());

    // Check title (highest weight)
    const titleText = item.title.toLowerCase();
    for (const keyword of normalizedKeywords) {
      if (titleText.includes(keyword)) {
        score += 3;
        // Bonus for exact word match
        if (this.isExactWordMatch(titleText, keyword)) {
          score += 2;
        }
      }
    }

    // Check description (medium weight)
    const descriptionText = item.description.toLowerCase();
    for (const keyword of normalizedKeywords) {
      if (descriptionText.includes(keyword)) {
        score += 2;
        if (this.isExactWordMatch(descriptionText, keyword)) {
          score += 1;
        }
      }
    }

    // Check content if available (medium weight)
    if (item.content) {
      const contentText = item.content.toLowerCase();
      for (const keyword of normalizedKeywords) {
        if (contentText.includes(keyword)) {
          score += 1;
          if (this.isExactWordMatch(contentText, keyword)) {
            score += 1;
          }
        }
      }
    }

    // Check categories (low weight)
    if (item.categories) {
      const categoriesText = item.categories.join(' ').toLowerCase();
      for (const keyword of normalizedKeywords) {
        if (categoriesText.includes(keyword)) {
          score += 1;
        }
      }
    }

    // Boost score for recent items (within last 7 days)
    const daysSincePublished = (Date.now() - item.pubDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePublished <= 7) {
      score *= 1.2;
    } else if (daysSincePublished <= 30) {
      score *= 1.1;
    }

    return score;
  }

  private isExactWordMatch(text: string, keyword: string): boolean {
    // Prevent ReDoS by limiting keyword length and complexity
    if (keyword.length > 100) return false;
    
    try {
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
      
      // Use timeout mechanism for regex execution
      const startTime = Date.now();
      const result = regex.test(text);
      
      // If regex takes too long (> 100ms), consider it a potential ReDoS
      if (Date.now() - startTime > 100) {
        console.warn(`Regex timeout detected for keyword: ${keyword.substring(0, 20)}...`);
        return false;
      }
      
      return result;
    } catch (error) {
      console.warn(`Regex error for keyword: ${keyword.substring(0, 20)}...`);
      return false;
    }
  }

  extractTrendingKeywords(items: FeedItem[], minMentions: number = 3): Map<string, number> {
    const keywordCounts = new Map<string, number>();
    
    // Common cybersecurity keywords to track
    const cybersecKeywords = [
      'malware', 'ransomware', 'phishing', 'vulnerability', 'exploit', 'breach', 'attack',
      'cybersecurity', 'security', 'hacker', 'threat', 'zero-day', 'patch', 'backdoor',
      'botnet', 'ddos', 'apt', 'credential', 'password', 'encryption', 'vpn', 'firewall',
      'ai', 'artificial intelligence', 'machine learning', 'deepfake', 'chatgpt', 'llm'
    ];

    for (const item of items) {
      const text = `${item.title} ${item.description} ${item.content || ''}`.toLowerCase();
      
      for (const keyword of cybersecKeywords) {
        try {
          const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
          
          const startTime = Date.now();
          const matches = text.match(regex);
          
          // Check for ReDoS timeout
          if (Date.now() - startTime > 100) {
            console.warn(`Regex timeout in trending keywords for: ${keyword}`);
            continue;
          }
          
          if (matches) {
            keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + matches.length);
          }
        } catch (error) {
          console.warn(`Regex error in trending keywords for: ${keyword}`);
          continue;
        }
      }
    }

    // Filter keywords with minimum mentions
    const filteredKeywords = new Map<string, number>();
    for (const [keyword, count] of keywordCounts.entries()) {
      if (count >= minMentions) {
        filteredKeywords.set(keyword, count);
      }
    }

    return filteredKeywords;
  }
}