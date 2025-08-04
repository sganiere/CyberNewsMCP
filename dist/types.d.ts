export interface CyberSecurityFeed {
    name: string;
    url: string;
    description: string;
    category: 'news' | 'threat-intelligence' | 'vulnerabilities' | 'research';
}
export interface FeedItem {
    title: string;
    link: string;
    pubDate: Date;
    description: string;
    content?: string;
    author?: string;
    categories?: string[];
    guid?: string;
}
export interface ParsedFeed {
    title: string;
    description: string;
    link: string;
    lastUpdated: Date;
    items: FeedItem[];
}
export interface SearchOptions {
    keywords?: string[];
    category?: CyberSecurityFeed['category'];
    dateFrom?: Date;
    dateTo?: Date;
    maxResults?: number;
}
export interface SearchResult {
    item: FeedItem;
    feedName: string;
    relevanceScore: number;
}
export interface TrendingTopic {
    topic: string;
    mentions: number;
    relatedItems: FeedItem[];
    category?: string;
}
export interface NewsBrief {
    title: string;
    summary: string;
    source: string;
    link: string;
    publishedDate: Date;
    category: string;
}
//# sourceMappingURL=types.d.ts.map