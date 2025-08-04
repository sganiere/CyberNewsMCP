import { CyberSecurityFeed } from './types.js';
export declare const CYBERSECURITY_FEEDS: CyberSecurityFeed[];
export declare function getFeedByName(name: string): CyberSecurityFeed | undefined;
export declare function getFeedsByCategory(category: CyberSecurityFeed['category']): CyberSecurityFeed[];
export declare function getAllFeedUrls(): string[];
//# sourceMappingURL=feeds.d.ts.map