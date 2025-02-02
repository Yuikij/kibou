import clsx from 'clsx';
import React from 'react';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Layout from '@theme/Layout';

import styles from './index.module.css';
import RecentBlogPosts from '@site/src/components/RecentBlogPosts';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const nrRecentBlogPosts = siteConfig.customFields.recentBlogPostsOnHomePage;
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <RecentBlogPosts nrPosts={nrRecentBlogPosts} />
        {/* <div className={styles.buttons}>
        <Link
         className="button button--secondary button--lg"
          to="/docs/intro">
           Docusaurus Tutorial - 5min ⏱️
          </Link>
        </div>  */}
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        {/* <HomepageFeatures /> */}
      </main>
    </Layout>
  );
}
