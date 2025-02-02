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
      
      // 获取所有博客文章
      const posts = content.blogPosts
        .filter(shouldBeListed)
        .map(({ content: _, ...post }) => post);
      
      // 提取标签信息
      const tags = {};
      posts.forEach(post => {
        post.metadata.tags.forEach(tag => {
          if (!tags[tag.label]) {
            tags[tag.label] = {
              count: 0,
              items: []
            };
          }
          tags[tag.label].count += 1;
          tags[tag.label].items.push(post);
        });
      });

      // 保存数据
      await actions.createData('blog-posts-metadata.json', JSON.stringify(posts));
      await actions.createData('blog-tags-metadata.json', JSON.stringify(tags));

      return blogPluginInstance.contentLoaded(params);
    },
  };
}

module.exports = {
  ...blogPluginExports,
  default: blogPluginExtended,
};