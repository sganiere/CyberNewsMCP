# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) Server for accessing, searching, and summarizing RSS feeds from cybersecurity websites. The server provides comprehensive tools for threat intelligence gathering in relation to AI and cyber security.

## Development Commands

```bash
# Install dependencies
npm install

# Development mode with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Type checking
npm run typecheck
```

## Architecture

### Core Components

- **RSSFeedParser** (`src/rss-parser.ts`): Handles RSS feed fetching and HTML content extraction
- **FeedSearcher** (`src/feed-searcher.ts`): Provides search functionality across feed items with filtering
- **ContentSummarizer** (`src/content-summarizer.ts`): Generates intelligent summaries and extracts trending topics
- **CyberSecurityRSSServer** (`src/index.ts`): Main MCP server implementation with tool handlers

### Key Features

- **Predefined Feeds**: Curated list of 11 top cybersecurity RSS sources in `src/feeds.ts`
- **Advanced Search**: Text search, keyword matching, date filtering, and category filtering
- **Content Summarization**: Automated summarization with focus areas and key point extraction
- **Trending Analysis**: Topic extraction and trend identification across feeds
- **Full Article Fetching**: Complete article content retrieval from URLs
- **Caching**: 30-minute feed cache for performance optimization

### MCP Tools Available

1. `list_feeds` - List available cybersecurity RSS feeds with category filtering
2. `fetch_feed` - Fetch content from a specific feed with configurable item limits
3. `fetch_multiple_feeds` - Fetch from multiple feeds simultaneously or by category
4. `search_by_keywords` - Keyword-based search with relevance scoring and date filtering
5. `get_trending_topics` - Extract trending cybersecurity topics from recent content
6. `get_news_briefs` - Get 100-125 word news summaries with date filtering, source links

## Feed Sources Included

- **News**: Krebs on Security, The Hacker News, Dark Reading, Threatpost, Security Week, BleepingComputer, TheRecord
- **Threat Intelligence**: SANS Internet Storm Center, FireEye Threat Research  
- **Vulnerabilities**: CISA Alerts
- **Research**: Malwarebytes Labs

## Security Focus

This server is designed specifically for **defensive security purposes**:
- Threat intelligence gathering
- AI cyber security news aggregation

## Development Notes

- Uses ES modules (`"type": "module"` in package.json)
- TypeScript with strict configuration
- Error handling implemented throughout with meaningful error messages
- RSS parsing with HTML sanitization using Cheerio
- Content extraction optimized for security-focused articles
- Relevance scoring for search results based on keyword density and recency