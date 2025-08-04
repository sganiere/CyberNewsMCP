# Cybersecurity RSS MCP Server

A Model Context Protocol (MCP) server that provides comprehensive access to cybersecurity RSS feeds with advanced search, summarization, and trending topic analysis capabilities.

## Features

- **16 Premium Cybersecurity RSS Sources** - Enterprise-grade security news, threat intelligence, and research feeds
- **Advanced Search** - Keyword-based search with relevance scoring and filtering
- **Content Summarization** - Generate concise 100-125 word news briefs
- **Trending Topic Analysis** - Extract and analyze trending cybersecurity topics
- **Full Article Fetching** - Retrieve complete article content when available
- **Intelligent Caching** - 30-minute feed cache for optimal performance

## Supported RSS Feeds

### News Sources (10 feeds)
- **Krebs on Security** - In-depth security news and investigation
- **Microsoft Security Blog** - Microsoft Security insights and updates
- **Proofpoint Threat Research** - Email security and threat research
- **SentinelOne Labs** - Endpoint security research and analysis
- **CrowdStrike Threat Research** - Advanced threat intelligence and research
- **The Hacker News** - Latest cybersecurity news and updates
- **Dark Reading** - Enterprise security news and analysis
- **Threatpost** - Breaking cybersecurity news
- **Security Week** - Security industry news and analysis
- **BleepingComputer** - Computer security and technology news
- **TheRecord** - Cybersecurity news and investigations

### Threat Intelligence (2 feeds)
- **SANS Internet Storm Center** - Daily security diary and threat analysis
- **FireEye Threat Research** - Advanced threat research and analysis

### Vulnerabilities (1 feed)
- **CISA Alerts** - Official US cybersecurity alerts and advisories

### Research (2 feeds)
- **EclecticIQ Threat Intelligence** - Strategic threat intelligence research
- **Malwarebytes Labs** - Malware research and security insights

## Installation

1. Clone the repository:
```bash
git clone https://github.com/sganiere/CyberNewsMCP
cd CyberNewsMCP
```

2. Install dependencies:
```bash
npm install
```

3. Build the server:
```bash
npm run build
```

## MCP Integration

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cybersecurity-rss": {
      "command": "node",
      "args": ["/path/to/CyberNewsMCP/dist/index.js"],
      "env": {}
    }
  }
}
```

### Using with MCP Client

The server implements the Model Context Protocol and can be used with any MCP-compatible client.

## Available Tools

### 1. `list_feeds`
List all available cybersecurity RSS feeds with optional category filtering.

**Parameters:**
- `category` (optional): Filter by category (`news`, `threat-intelligence`, `vulnerabilities`, `research`)

### 2. `fetch_feed`
Fetch content from a specific cybersecurity RSS feed.

**Parameters:**
- `feedName` (required): Name of the feed to fetch (partial match supported)
- `maxItems` (optional): Maximum number of items to return (default: 20)

### 3. `fetch_multiple_feeds`
Fetch content from multiple feeds simultaneously.

**Parameters:**
- `feedNames` (optional): Array of feed names to fetch
- `category` (optional): Fetch all feeds from a specific category
- `maxItemsPerFeed` (optional): Maximum items per feed (default: 10)

### 4. `search_by_keywords`
Search across all feeds using keywords with advanced filtering.

**Parameters:**
- `keywords` (required): Array of keywords to search for
- `category` (optional): Filter by feed category
- `dateFrom` (optional): Start date for filtering (YYYY-MM-DD)
- `dateTo` (optional): End date for filtering (YYYY-MM-DD)
- `maxResults` (optional): Maximum number of results (default: 50)

### 5. `get_trending_topics`
Extract trending cybersecurity topics from recent feed content.

**Parameters:**
- `daysBack` (optional): Number of days to analyze (default: 7)
- `minMentions` (optional): Minimum mentions for trending status (default: 5)
- `maxTopics` (optional): Maximum topics to return (default: 10)

### 6. `get_news_briefs`
Generate concise news summaries with source links.

**Parameters:**
- `category` (optional): Filter by category
- `dateFrom` (optional): Start date for filtering (YYYY-MM-DD)
- `dateTo` (optional): End date for filtering (YYYY-MM-DD)  
- `maxBriefs` (optional): Maximum number of briefs (default: 10)

## Example Usage

### Natural Language Queries (Recommended)

Once integrated with Claude Desktop, you can use natural language queries like:

**AI Threat Intelligence:**
- *"Show me the latest news on how threat actors are leveraging AI for the last month. You must include the link to the source"*
- *"Show me the trend on the misuse of AI by cyber threat actors for the last month. You must include the link to the source"*

**General Cybersecurity Queries:**
- *"What are the trending cybersecurity topics this week?"*
- *"Search for recent ransomware attacks with links to sources"*
- *"Get news briefs about zero-day vulnerabilities from the past week"*
- *"Fetch the latest content from Krebs on Security and SANS"*
- *"Find articles about data breaches in the healthcare sector"*

**Threat Intelligence Research:**
- *"Show me trending APT activities from threat intelligence feeds"*
- *"Search for recent vulnerability disclosures with CVE references"*
- *"Get summaries of the latest security research from Malwarebytes"*


### Adding New Feeds

1. Add feed definition to `CYBERSECURITY_FEEDS` array in `src/feeds.ts`
2. Include name, URL, description, and category
3. Test with development server

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper TypeScript typing
4. Ensure tests pass: `npm run typecheck && npm run lint`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Troubleshooting

### Debugging

Enable debug logging by setting environment variable:
```bash
DEBUG=true npm start
```

## Support

For issues and feature requests, please use the GitHub issue tracker.

## AI Influence Level

Level 5 - AI Created, Little Human Involvment

This tool was created by Claude Code

https://danielmiessler.com/blog/ai-influence-level-ail 