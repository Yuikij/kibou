// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'Yuikij\'s  blog',
    tagline: 'Dinosaurs are cool',
    favicon: 'img/favicon.ico',

    // Set the production url of your site here
    url: 'https://your-docusaurus-test-site.com',
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/kibou/',


    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'Yuikij', // Usually your GitHub org/user name.
    projectName: 'kibou', // Usually your repo name.
    trailingSlash: false,

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',

    // Even if you don't use internalization, you can use this field to set useful
    // metadata like html lang. For example, if your site is Chinese, you may want
    // to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },
    markdown: {
        format: 'detect',
        mermaid: true,
        // preprocessor: ({filePath, fileContent}) => {
        //     return fileContent.replaceAll('{{MY_VAR}}', 'MY_VALUE');
        // },
        mdx1Compat: {
            comments: true,
            admonitions: true,
            headingIds: true,
        },
    },
    presets: [
        [
            'classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                },
                blog: {
                    showReadingTime: true,
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            }),
        ],
    ],

    themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            // Replace with your project's social card
            image: 'img/docusaurus-social-card.jpg',
            navbar: {
                title: 'Yuikij\'s  blog',
                logo: {
                    alt: 'to be kibou',
                    src: 'img/logo.svg',
                },
                items: [
                    {
                        type: 'dropdown',
                        label: '基础知识',
                        sidebarId: 'basicKnowledge',
                        to: '/docs/basicKnowledge',
                        position: 'left',
                        items: [
                            {
                                type: 'docSidebar',
                                sidebarId: 'programmingLanguage',
                                label: '编程语言',
                            },
                            {
                                type: 'docSidebar',
                                sidebarId: 'network',
                                label: '网络知识',
                            },
                            // ... more items
                        ],
                    },
                    {
                        type: 'docSidebar',
                        sidebarId: 'database',
                        position: 'left',
                        label: '数据库',
                    },
                    {
                        type: 'docSidebar',
                        sidebarId: 'distributedSystems',
                        position: 'left',
                        label: '分布式系统',
                    },



                    // right
                    {to: '/blog', label: 'Blog', position: 'right'},
                    {
                        type: 'dropdown',
                        label: '备忘录',
                        position: 'right',
                        items: [
                            {
                                type: 'docSidebar',
                                sidebarId: 'memorandum',
                                label: 'sg',
                            },
                            // ... more items
                        ],
                    },
                    {
                        type: 'search',
                        position: 'right',
                    },
                    {
                        href: 'https://github.com/facebook/docusaurus',
                        label: 'GitHub',
                        position: 'right',
                    },
                ],
            },
            footer: {
                style: 'dark',
                links: [
                    {
                        title: 'Docs',
                        items: [
                            {
                                label: 'Tutorial',
                                to: '/docs/intro',
                            },
                        ],
                    },
                    {
                        title: 'Community',
                        items: [
                            {
                                label: 'Stack Overflow',
                                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
                            },
                            {
                                label: 'Discord',
                                href: 'https://discordapp.com/invite/docusaurus',
                            },
                            {
                                label: 'Twitter',
                                href: 'https://twitter.com/docusaurus',
                            },
                        ],
                    },
                    {
                        title: 'More',
                        items: [
                            {
                                label: 'Blog',
                                to: '/blog',
                            },
                            {
                                label: 'GitHub',
                                href: 'https://github.com/facebook/docusaurus',
                            },
                        ],
                    },
                ],
                copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
            },
        }),
};

module.exports = config;
