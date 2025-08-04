export class ContentSummarizer {
    generateNewsBrief(item, feedName, targetWordCount = 120) {
        const summary = this.extractiveSummarization(item.description, targetWordCount);
        return {
            title: item.title,
            summary,
            source: feedName,
            link: item.link,
            publishedDate: item.pubDate,
            category: this.categorizeContent(item)
        };
    }
    generateMultipleBriefs(items, feedName, maxBriefs = 10) {
        return items
            .slice(0, maxBriefs)
            .map(item => this.generateNewsBrief(item, feedName));
    }
    extractTrendingTopics(allItems, minMentions = 5) {
        const topicMap = new Map();
        // Define cybersecurity topic patterns
        const topicPatterns = [
            { name: 'AI Security', patterns: ['ai', 'artificial intelligence', 'machine learning', 'chatgpt', 'llm', 'deepfake'] },
            { name: 'Ransomware', patterns: ['ransomware', 'crypto locker', 'encryption attack'] },
            { name: 'Phishing', patterns: ['phishing', 'social engineering', 'email attack', 'credential theft'] },
            { name: 'Zero-day', patterns: ['zero-day', 'zero day', '0-day', 'unknown vulnerability'] },
            { name: 'Data Breach', patterns: ['data breach', 'breach', 'data leak', 'exposed data'] },
            { name: 'Malware', patterns: ['malware', 'trojan', 'virus', 'worm', 'backdoor'] },
            { name: 'APT', patterns: ['apt', 'advanced persistent threat', 'nation state', 'state-sponsored'] },
            { name: 'Vulnerability', patterns: ['vulnerability', 'cve-', 'security flaw', 'exploit'] },
            { name: 'DDoS', patterns: ['ddos', 'denial of service', 'botnet attack'] },
            { name: 'Cloud Security', patterns: ['cloud security', 'aws security', 'azure security', 'cloud breach'] },
            { name: 'IoT Security', patterns: ['iot security', 'smart device', 'connected device'] },
            { name: 'Mobile Security', patterns: ['mobile malware', 'android malware', 'ios security'] }
        ];
        // Analyze each item for topic mentions
        for (const item of allItems) {
            const text = `${item.title} ${item.description} ${item.content || ''}`.toLowerCase();
            for (const topic of topicPatterns) {
                let mentionCount = 0;
                for (const pattern of topic.patterns) {
                    try {
                        const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const regex = new RegExp(`\\b${escapedPattern}\\b`, 'gi');
                        const startTime = Date.now();
                        const matches = text.match(regex);
                        // Check for ReDoS timeout
                        if (Date.now() - startTime > 100) {
                            console.warn(`Regex timeout in topic analysis for pattern: ${pattern}`);
                            continue;
                        }
                        if (matches) {
                            mentionCount += matches.length;
                        }
                    }
                    catch (error) {
                        console.warn(`Regex error in topic analysis for pattern: ${pattern}`);
                        continue;
                    }
                }
                if (mentionCount > 0) {
                    const existing = topicMap.get(topic.name);
                    if (existing) {
                        existing.count += mentionCount;
                        existing.items.push(item);
                    }
                    else {
                        topicMap.set(topic.name, { count: mentionCount, items: [item] });
                    }
                }
            }
        }
        // Convert to TrendingTopic array and filter by minimum mentions
        const trendingTopics = [];
        for (const [topicName, data] of topicMap.entries()) {
            if (data.count >= minMentions) {
                trendingTopics.push({
                    topic: topicName,
                    mentions: data.count,
                    relatedItems: data.items.slice(0, 5), // Limit to 5 most relevant items
                    category: this.getTopicCategory(topicName)
                });
            }
        }
        // Sort by mentions count (descending)
        return trendingTopics.sort((a, b) => b.mentions - a.mentions);
    }
    extractiveSummarization(text, targetWordCount) {
        if (!text || text.length === 0) {
            return 'No summary available.';
        }
        // Split into sentences
        const sentences = this.splitIntoSentences(text);
        if (sentences.length === 0) {
            return text.substring(0, targetWordCount * 6); // Rough estimate: 6 chars per word
        }
        // Score sentences based on various factors
        const scoredSentences = sentences.map((sentence, index) => ({
            sentence,
            score: this.scoreSentence(sentence, index, sentences.length),
            index
        }));
        // Sort by score (descending)
        scoredSentences.sort((a, b) => b.score - a.score);
        // Select sentences until we reach target word count
        let summary = '';
        let wordCount = 0;
        const selectedIndices = [];
        for (const scored of scoredSentences) {
            const sentenceWordCount = scored.sentence.split(/\s+/).length;
            if (wordCount + sentenceWordCount <= targetWordCount) {
                summary += scored.sentence + ' ';
                wordCount += sentenceWordCount;
                selectedIndices.push(scored.index);
            }
            if (wordCount >= targetWordCount * 0.8) { // Allow 80% of target
                break;
            }
        }
        // If we have selected sentences, reorder them by original position
        if (selectedIndices.length > 0) {
            selectedIndices.sort((a, b) => a - b);
            summary = selectedIndices.map(i => sentences[i]).join(' ');
        }
        return summary.trim() || text.substring(0, targetWordCount * 6);
    }
    splitIntoSentences(text) {
        // Simple sentence splitting - could be enhanced with NLP library
        return text
            .split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 10); // Filter out very short fragments
    }
    scoreSentence(sentence, position, totalSentences) {
        let score = 0;
        // Position scoring (first and last sentences often important)
        if (position === 0)
            score += 2; // First sentence
        if (position === totalSentences - 1)
            score += 1; // Last sentence
        // Length scoring (prefer medium-length sentences)
        const wordCount = sentence.split(/\s+/).length;
        if (wordCount >= 10 && wordCount <= 25)
            score += 2;
        else if (wordCount >= 5 && wordCount <= 40)
            score += 1;
        // Keyword density for cybersecurity content
        const cybersecWords = [
            'security', 'attack', 'vulnerability', 'threat', 'malware', 'ransomware',
            'phishing', 'breach', 'exploit', 'hacker', 'cybersecurity', 'data'
        ];
        const lowerSentence = sentence.toLowerCase();
        for (const word of cybersecWords) {
            if (lowerSentence.includes(word)) {
                score += 1;
            }
        }
        // Numeric data often important in security context
        if (/\d+/.test(sentence)) {
            score += 1;
        }
        // Quoted content often important
        if (/"[^"]*"/.test(sentence)) {
            score += 1;
        }
        return score;
    }
    categorizeContent(item) {
        const text = `${item.title} ${item.description}`.toLowerCase();
        const categories = [
            { name: 'vulnerability', keywords: ['vulnerability', 'cve-', 'exploit', 'patch', 'security flaw'] },
            { name: 'malware', keywords: ['malware', 'ransomware', 'trojan', 'virus', 'backdoor'] },
            { name: 'breach', keywords: ['breach', 'data leak', 'exposed', 'stolen data'] },
            { name: 'threat-intelligence', keywords: ['apt', 'threat actor', 'campaign', 'attribution'] },
            { name: 'ai-security', keywords: ['ai', 'artificial intelligence', 'machine learning', 'chatgpt'] }
        ];
        for (const category of categories) {
            for (const keyword of category.keywords) {
                if (text.includes(keyword)) {
                    return category.name;
                }
            }
        }
        return 'general';
    }
    getTopicCategory(topicName) {
        const categoryMap = {
            'AI Security': 'ai-security',
            'Ransomware': 'malware',
            'Phishing': 'social-engineering',
            'Zero-day': 'vulnerability',
            'Data Breach': 'breach',
            'Malware': 'malware',
            'APT': 'threat-intelligence',
            'Vulnerability': 'vulnerability',
            'DDoS': 'attack',
            'Cloud Security': 'cloud',
            'IoT Security': 'iot',
            'Mobile Security': 'mobile'
        };
        return categoryMap[topicName] || 'general';
    }
}
//# sourceMappingURL=content-summarizer.js.map