# Technology Stack

## Framework & Build System
- **Docusaurus 3.7** - Static site generator
- **React 18** - UI framework
- **Node.js >=16.14** - Runtime requirement
- **Yarn** - Package manager

## Key Dependencies
- **@docusaurus/preset-classic** - Core Docusaurus preset
- **@docusaurus/theme-live-codeblock** - Interactive code examples
- **@docusaurus/theme-mermaid** - Diagram support
- **@easyops-cn/docusaurus-search-local** - Local search with Chinese support
- **Ant Design** - UI components (antd + @ant-design/icons)
- **Styled Components** - CSS-in-JS styling
- **Prism** - Syntax highlighting (supports PowerShell, Java, Bash, SQL, Python)

## Development Commands
```bash
# Install dependencies
yarn

# Start development server (accessible on all interfaces)
yarn start

# Build for production (with increased memory allocation)
yarn build

# Serve built site locally
yarn serve

# Clear cache
yarn clear

# Deploy to GitHub Pages
yarn deploy
```

## Configuration Files
- `docusaurus.config.js` - Main configuration
- `sidebars.js` - Documentation sidebar structure
- `babel.config.js` - Babel configuration
- `plugins/blog-plugin.js` - Custom blog plugin with metadata extraction

## Deployment
- **Target**: GitHub Pages
- **Base URL**: `/kibou/`
- **Organization**: Yuikij
- **Build script**: Uses NODE_OPTIONS for memory optimization