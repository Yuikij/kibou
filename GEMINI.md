# GEMINI.md

## Project Overview

This is a personal blog and documentation website built with Docusaurus 2. It serves as a platform for the author to share their thoughts on various topics, including technology, literature, and personal experiences. The site also includes a comprehensive documentation section covering a wide range of technical subjects.

**Main Technologies:**

*   **Docusaurus 2:** A modern static website generator for building documentation websites and blogs.
*   **React:** A JavaScript library for building user interfaces.
*   **Node.js:** A JavaScript runtime environment for executing JavaScript code on the server.
*   **Yarn:** A package manager for managing the project's dependencies.

**Architecture:**

The project follows a standard Docusaurus 2 structure:

*   **`blog/`:** Contains Markdown files for blog posts.
*   **`docs/`:** Contains Markdown files for documentation, organized into various categories.
*   **`src/`:** Contains custom React components, pages, and CSS for the website.
*   **`docusaurus.config.js`:** The main configuration file for the Docusaurus site.
*   **`package.json`:** Defines the project's dependencies and scripts.
*   **`sidebars.js`:** Configures the sidebar for the documentation sections.

## Building and Running

**Installation:**

```bash
yarn
```

**Local Development:**

```bash
yarn start
```

This command starts a local development server and opens a browser window. Most changes are reflected live without restarting the server.

**Build:**

```bash
yarn build
```

This command generates static content into the `build` directory, which can be served by any static content hosting service.

**Deployment:**

The project is automatically deployed to GitHub Pages whenever changes are pushed to the `master` branch. The deployment process is defined in the `.github/workflows/deploy.yml` file.

## Development Conventions

*   **Content:** Blog posts and documentation are written in Markdown.
*   **Customization:** The website is customized through React components in the `src/` directory and plugins in the `plugins/` directory.
*   **Styling:** Custom styles are defined in `src/css/custom.css`.
*   **Dependencies:** Project dependencies are managed with Yarn.
