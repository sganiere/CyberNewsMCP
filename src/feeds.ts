import { CyberSecurityFeed } from './types.js';

export const CYBERSECURITY_FEEDS: CyberSecurityFeed[] = [
  {
    name: "Krebs on Security",
    url: "https://krebsonsecurity.com/feed/",
    description: "In-depth security news and investigation",
    category: "research"
  },
  {
    name: "Palo Alto - Unit 42",
    url: "https://researchcenter.paloaltonetworks.com/unit42/feed/",
    description: "Palo Alto - Unit 42",
    category: "research"
  },
  {
    name: "SANS Internet Storm Center",
    url: "https://isc.sans.edu/rssfeed.xml",
    description: "Daily security diary and threat analysis",
    category: "news"
  },
  {
    name: "EclecticIQ Threat Intelligence",
    url: "https://blog.eclecticiq.com/rss.xml",
    description: "EclecticIQ Threat Intelligence Blog",
    category: "research"
  },
  {
    name: "Microsoft Security Blog",
    url: "https://www.microsoft.com/security/blog/feed/",
    description: "Microsoft Security Blog",
    category: "news"
  },
  {
    name: "Proofpoint Threat Research",
    url: "https://www.proofpoint.com/us/threat-insight-blog.xml",
    description: "Proofpoint Threat Research Blog",
    category: "research"
  },
  {
    name: "SentinelOne Labs",
    url: "https://www.sentinelone.com/labs/feed/",
    description: "SentinelOne Labs Blog",
    category: "research"
  },
  {
    name: "Crowdstrike Threat Research",
    url: "https://www.crowdstrike.com/blog/category/threat-intel-research/",
    description: "Crowdstrike Threat Research Blog",
    category: "research"
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

export function getFeedByName(name: string): CyberSecurityFeed | undefined {
  return CYBERSECURITY_FEEDS.find(feed => 
    feed.name.toLowerCase().includes(name.toLowerCase())
  );
}

export function getFeedsByCategory(category: CyberSecurityFeed['category']): CyberSecurityFeed[] {
  return CYBERSECURITY_FEEDS.filter(feed => feed.category === category);
}

export function getAllFeedUrls(): string[] {
  return CYBERSECURITY_FEEDS.map(feed => feed.url);
}