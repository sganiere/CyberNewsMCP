export const CYBERSECURITY_FEEDS = [
    {
        name: "Krebs on Security",
        url: "https://krebsonsecurity.com/feed/",
        description: "In-depth security news and investigation",
        category: "news"
    },
    {
        name: "SANS Internet Storm Center",
        url: "https://isc.sans.edu/rssfeed.xml",
        description: "Daily security diary and threat analysis",
        category: "threat-intelligence"
    },
    {
        name: "CISA Alerts",
        url: "https://www.cisa.gov/cybersecurity-advisories/all.xml",
        description: "Official US cybersecurity alerts and advisories",
        category: "vulnerabilities"
    },
    {
        name: "The Hacker News",
        url: "https://thehackernews.com/feeds/posts/default",
        description: "Latest cybersecurity news and updates",
        category: "news"
    },
    {
        name: "Dark Reading",
        url: "https://www.darkreading.com/rss.xml",
        description: "Enterprise security news and analysis",
        category: "news"
    },
    {
        name: "Threatpost",
        url: "https://threatpost.com/feed/",
        description: "Breaking cybersecurity news",
        category: "news"
    },
    {
        name: "Security Week",
        url: "https://www.securityweek.com/feed/",
        description: "Security industry news and analysis",
        category: "news"
    },
    {
        name: "Malwarebytes Labs",
        url: "https://blog.malwarebytes.com/feed/",
        description: "Malware research and security insights",
        category: "research"
    },
    {
        name: "FireEye Threat Research",
        url: "https://www.fireeye.com/blog/threat-research/_jcr_content.feed",
        description: "Advanced threat research and analysis",
        category: "threat-intelligence"
    },
    {
        name: "BleepingComputer",
        url: "https://www.bleepingcomputer.com/feed/",
        description: "Computer security and technology news",
        category: "news"
    },
    {
        name: "TheRecord",
        url: "https://therecord.media/feed/",
        description: "Cybersecurity news and investigations",
        category: "news"
    }
];
export function getFeedByName(name) {
    return CYBERSECURITY_FEEDS.find(feed => feed.name.toLowerCase().includes(name.toLowerCase()));
}
export function getFeedsByCategory(category) {
    return CYBERSECURITY_FEEDS.filter(feed => feed.category === category);
}
export function getAllFeedUrls() {
    return CYBERSECURITY_FEEDS.map(feed => feed.url);
}
//# sourceMappingURL=feeds.js.map