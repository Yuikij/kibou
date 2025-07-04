// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
import { themes as prismThemes } from 'prism-react-renderer';
// const lightCodeTheme = require('prism-react-renderer/themes/github');
// const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'Yuikij\'s  blog',
    tagline: 'おとといはウサギお见たの、昨日は鹿、今日はあなた',
    favicon: 'img/avatar.jpg',

    // Set the production url of your site here
    url: 'https://your-docusaurus-test-site.com',
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/kibou/',
    themes: ["@docusaurus/theme-live-codeblock","@docusaurus/theme-mermaid",   [
        require.resolve("@easyops-cn/docusaurus-search-local"),
        ({
          // ... Your options.
          // `hashed` is recommended as long-term-cache of index file is possible.
          hashed: true,
          // For Docs using Chinese, The `language` is recommended to set to:
          // ```
          language: ["en", "zh"],
          // ```
        }),
      ]],

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
    plugins: [
    
        [
            './plugins/blog-plugin',
            {
                blogSidebarTitle: 'All posts',
                blogSidebarCount: 10,
                showReadingTime: true, // When set to false, the "x min read" won't be shown
                readingTime: ({content, frontMatter, defaultReadingTime}) =>
                  defaultReadingTime({content, options: {wordsPerMinute: 300}}),

            },
          ]
    
    ],
    markdown: {
        format: 'detect',
        mermaid: true,
        preprocessor: ({filePath, fileContent}) => {
            return fileContent.replaceAll('{{MY_VAR}}', 'MY_VALUE');
        },
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
                // blog: {
                //     blogSidebarTitle: 'All posts',
                //     blogSidebarCount: 10,
                //     showReadingTime: true, // When set to false, the "x min read" won't be shown
                //     readingTime: ({content, frontMatter, defaultReadingTime}) =>
                //       defaultReadingTime({content, options: {wordsPerMinute: 300}}),
                // },
                blog: false,
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            }),
        ],
    ],

    themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        {
            metadata: [
                {name: 'keywords', content: 'Yuikij\'s  blog, blog, Yuikij'},
                {name: 'description', content: 'Yuikij\'s  blog'},
                {name: 'robots', content: 'index, follow'},
                {name: 'viewport', content: 'width=device-width, initial-scale=1.0'},
                {name: 'google-site-verification', content: '-xEN6xN-ZxgRBYd5yWu6wEmhSpllJZAZSLXGTAJkzzU'},
                {property: 'og:description', content: 'Yuikij\'s  blog'},
              ],
            // Replace with your project's social card
            image: 'img/avatar.jpg',
            docs: {
                sidebar: {
                  hideable: true,
                },
              },
            colorMode: {
                defaultMode: 'dark',
                disableSwitch: false,
                respectPrefersColorScheme: false,
            },
            navbar: {
                title: 'Yuikij\'s  blog',
                logo: {
                    alt: 'to be kibou',
                    src: 'img/avatar.jpg',
                },
                items: [
                    {
                        type: 'dropdown',
                        label: '基础',
                        position: 'left',
                        items: [
                            {
                                type: 'docSidebar',
                                sidebarId: 'programmingLanguage',
                                label: '编程语言',
                            },
                            {
                                type: 'docSidebar',
                                sidebarId: 'framework',
                                label: '软件框架',
                            },
                            {
                                type: 'docSidebar',
                                sidebarId: 'network',
                                label: '网络',
                            },
                            {
                                type: 'docSidebar',
                                sidebarId: 'database',
                                label: '数据库',
                            },
                            {
                                type: 'docSidebar',
                                sidebarId: 'algorithm',
                                label: '算法和数据结构',
                            },
                            {
                                type: 'docSidebar',
                                sidebarId: 'distributedSystems',
                                label: '分布式系统',
                            },
                        ],
                    },
                    {
                        type: 'dropdown',
                        label: '应用',
                        position: 'left',
                        items: [
                            {
                                type: 'docSidebar',
                                sidebarId: 'git',
                                label: 'Git',
                            },
                            {
                                type: 'docSidebar',
                                sidebarId: 'linux',
                                label: 'Linux',
                            },
                            {
                                type: 'docSidebar',
                                sidebarId: 'operation',
                                label: '运维相关',
                            },
                            {
                                type: 'docSidebar',
                                sidebarId: 'design',
                                label: '软件设计',
                            },
                            {
                                type: 'docSidebar',
                                sidebarId: 'middleware',
                                label: '中间件',
                            },
                        ],
                    },
                    {
                        type: 'docSidebar',
                        sidebarId: 'publishClass',
                        position: 'right',
                        label: '公开课',
                    },
        
                    {
                        type: 'docSidebar',
                        sidebarId: 'naturalLanguage',
                        position: 'right',
                        label: '语言',
                    },
                    // right
                    {to: '/blog', label: '日记', position: 'right'},
                    {
                        type: 'docSidebar',
                        label: 'AI编程',
                        sidebarId: 'ai',
                        position: 'right',
                      },
                    {
                        type: 'dropdown',
                        label: '备忘录',
                        position: 'right',
                        items: [
                            {
                                type: 'docSidebar',
                                sidebarId: 'SuperGame',
                                label: 'SG论坛',
                            },
                            {
                                type: 'docSidebar',
                                sidebarId: 'deepResearch',
                                label: '深度解读',
                            },
                            {
                                type: 'docSidebar',
                                sidebarId: 'prepareExam',
                                label: '备考面试',
                            },
                            {
                                type: 'docSidebar',
                                sidebarId: 'gpt',
                                label: '小贴士',
                            },

                            // ... more items
                        ],
                    },
                    {
                        type: 'search',
                        position: 'right',
                    },
                    {
                        href: 'https://books.yuisama.top',
                        label: '图书馆',
                        position: 'right',
                    },
                    {
                        href: 'https://github.com/Yuikij',
                        label: 'GitHub',
                        position: 'right',
                    },
                ],
            },
            footer: {
                style: 'light',
                // links: [
                //     {
                //         title: 'Docs',
                //         items: [
                //             {
                //                 label: 'Tutorial',
                //                 to: '/docs/intro',
                //             },
                //         ],
                //     },
                //     {
                //         title: 'Community',
                //         items: [
                //             {
                //                 label: 'Stack Overflow',
                //                 href: 'https://stackoverflow.com/questions/tagged/docusaurus',
                //             },
                //             {
                //                 label: 'Discord',
                //                 href: 'https://discordapp.com/invite/docusaurus',
                //             }
                //         ],
                //     },
                //     {
                //         title: '更多',
                //         items: [
                //             {
                //                 label: 'shiori',
                //                 to: '/blog',
                //             },
                //             {
                //                 label: 'GitHub',
                //                 href: 'https://github.com/facebook/docusaurus',
                //             },
                //         ],
                //     },
                // ],
                copyright: `Copyright © ${new Date().getFullYear()} Yuikij's blog, Inc. Built with Docusaurus.`,
            },
            prism: {
                theme: prismThemes.github,
                darkTheme: prismThemes.dracula,
                additionalLanguages: ['powershell','java','bash','ini','sql','python'],
            },
        },
};

module.exports = config;
