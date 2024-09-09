import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './navigation.module.css';

export default function NavigationPage() {
  return (
    <Layout title="导航页面" description="这是一个自定义的导航页面">
      <main className={styles.container}>
        <h1>网站导航</h1>
        <div className={styles.sections}>
          <section>
            <h2>文档</h2>
            <ul>
              <li><Link to="/docs/intro">介绍</Link></li>
              <li><Link to="/docs/getting-started">快速开始</Link></li>
              <li><Link to="/docs/api">API 文档</Link></li>
            </ul>
          </section>
          <section>
            <h2>博客</h2>
            <ul>
              <li><Link to="/blog">最新博客</Link></li>
              <li><Link to="/blog/tags">标签</Link></li>
              <li><Link to="/blog/archive">归档</Link></li>
            </ul>
          </section>
          <section>
            <h2>社区</h2>
            <ul>
              <li><a href="https://github.com/yourrepo">GitHub</a></li>
              <li><a href="https://twitter.com/yourhandle">Twitter</a></li>
              <li><a href="https://discord.gg/yourserver">Discord</a></li>
            </ul>
          </section>
        </div>
      </main>
    </Layout>
  );
}
