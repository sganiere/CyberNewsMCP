import { CyberSecurityFeed, ParsedFeed } from './types.js';
export declare class RSSFeedParser {
    private parser;
    constructor();
    parseFeed(feed: CyberSecurityFeed): Promise<ParsedFeed>;
    parseMultipleFeeds(feeds: CyberSecurityFeed[]): Promise<Map<string, ParsedFeed>>;
    fetchFullArticle(url: string): Promise<string | null>;
    private sanitizeContent;
}
//# sourceMappingURL=rss-parser.d.ts.map