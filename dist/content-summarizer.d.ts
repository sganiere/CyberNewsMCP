import { FeedItem, TrendingTopic, NewsBrief } from './types.js';
export declare class ContentSummarizer {
    generateNewsBrief(item: FeedItem, feedName: string, targetWordCount?: number): NewsBrief;
    generateMultipleBriefs(items: FeedItem[], feedName: string, maxBriefs?: number): NewsBrief[];
    extractTrendingTopics(allItems: FeedItem[], minMentions?: number): TrendingTopic[];
    private extractiveSummarization;
    private splitIntoSentences;
    private scoreSentence;
    private categorizeContent;
    private getTopicCategory;
}
//# sourceMappingURL=content-summarizer.d.ts.map