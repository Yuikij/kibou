# Project Structure

## Root Level
- `docusaurus.config.js` - Main site configuration
- `sidebars.js` - Sidebar navigation structure
- `package.json` - Dependencies and scripts
- `babel.config.js` - Babel configuration

## Content Organization

### `/blog/` - Personal Blog Posts
- Date-prefixed MDX files (YYYY-MM-DD-title.mdx)
- `authors.yml` - Author information
- Supports both `.md` and `.mdx` formats
- Uses frontmatter with title, authors, tags, description

### `/docs/` - Documentation Content
Organized by topic with auto-generated sidebars:

**Core Technical Topics:**
- `ai/` - AI programming content
- `algorithm/` - Algorithms and data structures
- `database/` - Database-related documentation
- `distributedSystems/` - Distributed systems content

**Basic Knowledge:**
- `basicKnowledge/programmingLanguage/` - Programming languages
- `basicKnowledge/framework/` - Software frameworks
- `basicKnowledge/network/` - Networking concepts

**Tools & Software:**
- `basicSoftware/Git/` - Git documentation
- `basicSoftware/Linux/` - Linux guides
- `basicSoftware/Operation/` - Operations content
- `basicSoftware/Design/` - Software design
- `basicSoftware/中间件/` - Middleware content

**Other Categories:**
- `naturalLanguage/` - Language learning
- `publishClass/` - Public course notes
- `prepareExam/` - Exam preparation
- `memorandum/` - Various memorandums and notes

### `/src/` - Source Code
- `components/` - React components
- `css/custom.css` - Global styles and CSS variables
- `pages/` - Custom pages
- `theme/` - Theme customizations

### `/plugins/` - Custom Plugins
- `blog-plugin.js` - Extended blog plugin with metadata extraction

### `/static/` - Static Assets
- `img/` - Images and media files
- `.nojekyll` - GitHub Pages configuration

## Naming Conventions
- Blog posts: `YYYY-MM-DD-title.mdx`
- Documentation: Descriptive names in appropriate language
- Folders: Use descriptive names, mix of English/Chinese as appropriate
- Components: PascalCase for React components

## Content Guidelines
- Use MDX for interactive content requiring React components
- Include proper frontmatter for all blog posts
- Organize documentation by logical topic hierarchy
- Support both English and Chinese content
- Use Mermaid for diagrams where appropriate