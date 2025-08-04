# Cybersecurity RSS MCP Server

A Model Context Protocol (MCP) server that provides comprehensive access to cybersecurity RSS feeds with advanced search, summarization, and trending topic analysis capabilities.

## Features

- **11 Curated Cybersecurity RSS Sources** - Top security news, threat intelligence, and research feeds
- **Advanced Search** - Keyword-based search with relevance scoring and filtering
- **Content Summarization** - Generate concise 100-125 word news briefs
- **Trending Topic Analysis** - Extract and analyze trending cybersecurity topics
- **Full Article Fetching** - Retrieve complete article content when available
- **Intelligent Caching** - 30-minute feed cache for optimal performance

## Supported RSS Feeds

### News Sources
- Krebs on Security
- The Hacker News
- Dark Reading
- Threatpost
- Security Week
- BleepingComputer
- TheRecord

### Threat Intelligence
- SANS Internet Storm Center
- FireEye Threat Research

### Vulnerabilities
- CISA Alerts

### Research
- Malwarebytes Labs

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hackernews_MCP2
```

2. Install dependencies:
```bash
npm install
```

3. Build the server:
```bash
npm run build
```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Other Commands
```bash
npm run typecheck  # Type checking
npm run lint      # Code linting
npm test         # Run tests
```

## MCP Integration

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cybersecurity-rss": {
      "command": "node",
      "args": ["/path/to/hackernews_MCP2/dist/index.js"],
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

### Direct Tool Usage (For Developers)

```javascript
// List all news feeds
{
  "tool": "list_feeds",
  "arguments": {
    "category": "news"
  }
}

// Search for AI security topics
{
  "tool": "search_by_keywords", 
  "arguments": {
    "keywords": ["AI", "artificial intelligence", "machine learning", "threat actor"],
    "dateFrom": "2024-07-01",
    "maxResults": 25
  }
}

// Get trending topics from last month
{
  "tool": "get_trending_topics",
  "arguments": {
    "daysBack": 30,
    "minMentions": 5,
    "maxTopics": 15
  }
}

// Generate news briefs with sources
{
  "tool": "get_news_briefs",
  "arguments": {
    "dateFrom": "2024-07-01",
    "maxBriefs": 15
  }
}
```

## Specialized AI & Cybersecurity Intelligence

This MCP server is specifically designed for **defensive cybersecurity research** with a focus on:

### 🤖 **AI Security Threat Intelligence**
- Track how threat actors are weaponizing AI technologies
- Monitor AI-powered attack techniques and defense strategies  
- Analyze trends in AI/ML security vulnerabilities
- Research deepfake and synthetic media threats

### 🛡️ **Comprehensive Threat Coverage**
- **Nation-state APT activities** and attribution research
- **Ransomware campaigns** and emerging variants
- **Zero-day vulnerabilities** and exploit development
- **Supply chain attacks** and software compromise
- **IoT and critical infrastructure** security incidents

### 📊 **Intelligence Analysis Features**
- **Trend identification** across multiple authoritative sources
- **Relevance scoring** for search results based on recency and keyword density
- **Content summarization** optimized for security professionals
- **Source attribution** with direct links to original articles
- **Date-range filtering** for incident timeline analysis

## Architecture

- **RSSFeedParser**: Handles RSS feed fetching and HTML content extraction
- **FeedSearcher**: Provides search functionality with relevance scoring
- **ContentSummarizer**: Generates summaries and extracts trending topics
- **CyberSecurityRSSServer**: Main MCP server implementation

## Security Focus

This server is designed specifically for **defensive security purposes**:
- Threat intelligence gathering
- Cybersecurity news aggregation
- Security research and analysis

## Technical Details

- **Language**: TypeScript
- **Runtime**: Node.js (ES Modules)
- **Dependencies**: 
  - `@modelcontextprotocol/sdk` - MCP implementation
  - `rss-parser` - RSS feed parsing
  - `cheerio` - HTML parsing and sanitization
  - `node-fetch` - HTTP requests
- **Build System**: TypeScript compiler
- **Code Quality**: ESLint with TypeScript rules

## Development

### Project Structure
```
src/
├── index.ts              # Main MCP server
├── feeds.ts              # Feed definitions and utilities
├── types.ts             # TypeScript type definitions
├── rss-parser.ts        # RSS parsing and content extraction
├── feed-searcher.ts     # Search functionality
└── content-summarizer.ts # Summarization and trending analysis
```

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

### Common Issues

1. **Feed parsing errors**: Some RSS feeds may be temporarily unavailable
2. **Network timeouts**: Feeds have 10-second timeout limits
3. **Memory usage**: Large result sets are automatically limited

### Debugging

Enable debug logging by setting environment variable:
```bash
DEBUG=true npm start
```

## Support

For issues and feature requests, please use the GitHub issue tracker.