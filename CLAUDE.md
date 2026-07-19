# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog and knowledge repository built with Docusaurus 3.7. The site serves as a technical documentation platform covering programming languages, algorithms, databases, distributed systems, and natural language learning (primarily Japanese).

## Development Commands

### Core Development
- `yarn start` - Start local development server on all interfaces (0.0.0.0)
- `yarn build` - Build the site for production (uses 8GB memory allocation)
- `yarn serve` - Serve the built site locally
- `yarn clear` - Clear Docusaurus cache

### Content Management
- `yarn write-translations` - Generate translation files
- `yarn write-heading-ids` - Generate heading IDs for documents

### Deployment (Cloudflare Workers)
- `yarn deploy` - Build and deploy site + chat API to Cloudflare Workers (kibou Worker, serves yuisama.top), then sync the RAG knowledge base
- `yarn preview` - Build and run locally with wrangler dev
- `yarn sync-rag` - Incrementally sync docs/ + blog/ markdown into the Cloudflare AI Search knowledge base on its own (requires SYNC_SECRET in .dev.vars); already included in `yarn deploy`

## Architecture

### Content Structure
The site uses Docusaurus's auto-generated sidebars with content organized in `/docs/`:
- `basicKnowledge/` - Programming languages, frameworks, networking
- `basicSoftware/` - Git, Linux, DevOps, design patterns, middleware
- `algorithm/` - Data structures and algorithms
- `database/` - MySQL, query optimization, transactions
- `distributedSystems/` - Distributed computing concepts
- `naturalLanguage/` - Language learning materials (Japanese)
- `memorandum/` - Personal notes and research
- `publishClass/` - Course notes and projects
- `ai/` - AI and LLM-related content

### Custom Components
Located in `src/components/`:
- `DataStructure/` - Interactive algorithm visualizations
- `Language/JapaneseText*.js` - Japanese text processing components
- `Quiz/` - Interactive quiz components
- `SnakeGame/` - Game implementation
- `Waline/` - Comment system integration
- `MarkmapComponent.js` - Mind map rendering
- `ChatAssistant/` - RAG chat widget (bottom-right); talks to same-origin `/api/chat` served by `worker/index.js`, backed by Cloudflare AI Search instance `kibou-rag` (see its README)

### Blog System
Uses custom blog plugin (`plugins/blog-plugin.js`) that extends Docusaurus's default blog functionality to extract and process blog metadata and tags.

### Configuration
- `docusaurus.config.js` - Main configuration with Chinese/English search, custom themes, navigation structure
- `sidebars.js` - Auto-generated sidebar configuration for different content sections
- Dark mode enabled by default
- Mermaid diagrams and live code blocks supported

### Custom Styling
- `src/css/custom.css` - Global styles
- Individual component CSS files alongside components

### Static Assets
- `static/img/` - Images organized by content type (avatar, cs186, jvm, shiori, etc.)

## Key Dependencies
- Docusaurus 3.7 with preset-classic
- Ant Design components and icons
- React 18 with live code blocks
- Local search plugin for Chinese/English content
- Mermaid diagram support
- Waline comment system
- Markmap for mind maps

## Development Notes
- Node.js version requirement: >=16.14
- Build process uses increased memory allocation (8GB) for large content processing
- Site is configured for GitHub Pages deployment to `/kibou/` base path
- Search functionality supports both English and Chinese content
- Custom blog plugin processes metadata for enhanced blog functionality