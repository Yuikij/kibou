import { shouldBeListed } from '@docusaurus/plugin-content-blog/src/blogUtils';
const blogPluginExports = require('@docusaurus/plugin-content-blog');

const defaultBlogPlugin = blogPluginExports.default;

async function blogPluginExtended(...pluginArgs) {
  const blogPluginInstance = await defaultBlogPlugin(...pluginArgs);

  return {
    // Add all properties of the default blog plugin so existing functionality is preserved
    ...blogPluginInstance,

    /**
     * Override the default `contentLoaded` hook to access blog posts data
     */
    contentLoaded: async function (params) {
      const { content, actions } = params;

      const posts = content.blogPosts
        .filter(shouldBeListed)
        .map(({ content: _, ...post }) => post);
      actions.createData('blog-posts-metadata.json', posts);

      // Call the default overridden `contentLoaded` implementation
      return blogPluginInstance.contentLoaded(params);
    },
  };
}

module.exports = {
  ...blogPluginExports,
  default: blogPluginExtended,
};