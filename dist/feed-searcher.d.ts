import { FeedItem, SearchOptions, SearchResult, CyberSecurityFeed } from './types.js';
export declare class FeedSearcher {
    searchFeeds(feedData: Map<string, {
        feed: CyberSecurityFeed;
        items: FeedItem[];
    }>, options: SearchOptions): SearchResult[];
    private filterByDateRange;
    private searchInItems;
    private calculateRelevanceScore;
    private isExactWordMatch;
    extractTrendingKeywords(items: FeedItem[], minMentions?: number): Map<string, number>;
}
//# sourceMappingURL=feed-searcher.d.ts.map