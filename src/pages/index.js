import clsx from 'clsx';
import React from 'react';
import Link from '@docusaurus/Link';
import { usePluginData } from '@docusaurus/useGlobalData';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import cssModuleStyles from './index.module.css';
import RecentBlogPosts from '@site/src/components/RecentBlogPosts';
import avatar from '@site/static/img/avatar.jpg';
import { useAllDocsData } from '@docusaurus/plugin-content-docs/client';
import blogMetadata from '@site/.docusaurus/docusaurus-plugin-content-blog/default/blog-posts-metadata.json';
import blogTags from '@site/.docusaurus/docusaurus-plugin-content-blog/default/blog-tags-metadata.json';


const inlineStyles = {
  blogList: {
    display: 'grid',
    gap: '2rem',
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  },
  blogCard: {
    padding: '1.5rem',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
  },
  blogTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: 'var(--text-primary)',
  },
  blogDate: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.5rem',
  },
  blogExcerpt: {
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  },
  mainContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '2rem',
  },
  sidebar: {
    position: 'sticky',
    top: '2rem',
    height: 'fit-content',
  },
  profile: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '12px',
    padding: '1.5rem',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  avatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    margin: '0 auto 1rem',
    border: '3px solid var(--ifm-color-primary)',
    objectFit: 'cover',
  },
  avatarContainer: {
    width: '120px',
    height: '120px',
    margin: '0 auto 1rem',
    borderRadius: '50%',
    border: '3px solid var(--ifm-color-primary)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  bio: {
    color: 'var(--text-secondary)',
    marginBottom: '1rem',
    lineHeight: '1.6',
  },
  socialLinks: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '1rem',
  },
  socialIcon: {
    color: 'var(--ifm-color-primary)',
    fontSize: '1.5rem',
  },
  tagsContainer: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  tagCloud: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  tag: {
    backgroundColor: 'var(--ifm-color-primary)',
    color: 'white',
    padding: '0.3rem 0.8rem',
    borderRadius: '20px',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    display: 'inline-block',
    ':hover': {
      transform: 'translateY(-2px)',
      opacity: 0.9,
      textDecoration: 'none',
      color: 'white',
    },
  },
  categoryList: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  categoryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    borderBottom: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    textDecoration: 'none',
  },
};

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', cssModuleStyles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
      </div>
    </header>
  );
}

function ProfileSection() {
  const {siteConfig} = useDocusaurusContext();
  
  return (
    <div style={inlineStyles.profile}>
      <img 
        src={avatar} 
        alt="Profile"
        style={inlineStyles.avatar}
      />

      <h2>{siteConfig.title}</h2>
      <p style={inlineStyles.bio}>{siteConfig.tagline}</p>
      <div style={inlineStyles.socialLinks}>
        <a href="https://github.com/yourusername" style={inlineStyles.socialIcon}>
          <i className="fab fa-github"></i>
        </a>
        <a href="https://twitter.com/yourusername" style={inlineStyles.socialIcon}>
          <i className="fab fa-twitter"></i>
        </a>
        {/* 添加更多社交媒体链接 */}
      </div>
    </div>
  );
}

function TagsSection() {
  const tags = blogTags?blogTags:{};
  console.log(blogTags);
  // 转换数据格式
  const formattedTags = Object.entries(tags).map(([label, data]) => ({
    label,
    count: data.items.length,
    permalink: `/blog/tags/${label.toLowerCase()}`
  }));

  // 按文章数量排序
  const sortedTags = formattedTags.sort((a, b) => b.count - a.count);

  return (
    <div style={inlineStyles.tagsContainer}>
      <h3>标签云</h3>
      <div style={inlineStyles.tagCloud}>
        {sortedTags.map((tag) => (
          <Link
            key={tag.label}
            href={tag.permalink}
            style={{
              ...inlineStyles.tag,
              fontSize: `${Math.max(0.8, Math.min(1.5, 0.8 + tag.count * 0.1))}rem`,
            }}
          >
            {tag.label} ({tag.count})
          </Link>
        ))}
      </div>
    </div>
  );
}

function CategoriesSection() {
  const categories = [
    { name: 'JAVA', path: '/docs/category/java-1' },
    { name: 'CS186', path: '/docs/publishClass/cs186/note/proj0&1' },
    // 添加更多分类
  ];

  return (
    <div style={inlineStyles.categoryList}>
      <h3>分类</h3>
      {categories.map(category => (
        <Link
          key={category.name}
          href={category.path}
          style={inlineStyles.categoryItem}
        >
          <span>{category.name}</span>
          {category.count && <span>{category.count}</span>}
        </Link>
      ))}
    </div>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  
  return (
    <Layout
      title={`${siteConfig.title} - 首页`}
      description={siteConfig.tagline}>
      <main style={inlineStyles.mainContainer}>
        <aside style={inlineStyles.sidebar}>
          <ProfileSection />
          <TagsSection />
          <CategoriesSection />
        </aside>
        
        <div>
          <RecentBlogPosts 
            nrPosts={siteConfig.customFields.recentBlogPostsOnHomePage}
            renderPost={(post) => (
              <Link 
                href={post.permalink}
                key={post.id}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  ...inlineStyles.blogCard,
                  ':hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 'var(--shadow)',
                  }
                }}>
                  <h2 style={inlineStyles.blogTitle}>{post.title}</h2>
                  <div style={inlineStyles.blogDate}>{post.date}</div>
                  <p style={inlineStyles.blogExcerpt}>{post.description}</p>
                </div>
              </Link>
            )}
            containerStyle={inlineStyles.blogList}
          />
        </div>
      </main>
    </Layout>
  );
}
