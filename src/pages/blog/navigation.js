import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import React from 'react';
import styles from './navigation.module.css';

const NavigationItem = ({ title, items }) => (
  <div className={styles.section}>
    <h2 className={styles.sectionTitle}>{title}</h2>
    <ul className={styles.sectionList}>
      {items.map((item, index) => (
        <li key={index}>
          <Link to={item.link} className={styles.itemLink}>
            {item.title}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const NavigationPage = () => {
  const navItems = [
    {
      title: '技术杂文',
      items: [
        { title: '调试器之工作原理', link: '/docs/debugger-principles' },
        { title: '工作环境小结', link: '/docs/work-environment-summary' },
        { title: 'NuttX mm模块在64位环境下的问题', link: '/docs/nuttx-mm-64bit-issue' },
        { title: '写C和链接大战三百回合', link: '/docs/c-programming-and-linking' },
        { title: '关于glibc与GLIBC_XX', link: '/docs/about-glibc-and-glibc-xx' },
      ],
    },
    {
      title: 'mold源码阅读[完结]',
      items: [
        { title: 'mold源码阅读 其零 main', link: '/docs/mold-source-main' },
        { title: 'mold源码阅读 其一 读取输入文件', link: '/docs/mold-source-input-files' },
        { title: 'mold源码阅读 其二 读取SharedFile', link: '/docs/mold-source-shared-file' },
        { title: 'mold源码阅读 其三 符号决议', link: '/docs/mold-source-symbol-resolution' },
        { title: 'mold源码阅读 其四 mergeable section', link: '/docs/mold-source-mergeable-section' },
        { title: 'mold源码阅读其五 符号相关', link: '/docs/mold-source-symbol-related' },
        { title: 'mold源码阅读其六 section size优化', link: '/docs/mold-source-section-size-optimization' },
        { title: 'mold源码阅读其七 创建输出段之前', link: '/docs/mold-source-before-output-sections' },
        { title: 'mold源码阅读其八 创建输出段', link: '/docs/mold-source-create-output-sections' },
        { title: 'mold源码阅读其九 未解析符号的处理', link: '/docs/mold-source-unresolved-symbols' },
        { title: 'mold源码阅读其十 段排序', link: '/docs/mold-source-section-sorting' },
        { title: 'mold源码阅读其十一 relr and dynsym', link: '/docs/mold-source-relr-and-dynsym' },
        { title: 'mold源码阅读其十二 创建一些输出段', link: '/docs/mold-source-create-some-output-sections' },
        { title: 'mold源码阅读其十三 计算shdr以及osec offset', link: '/docs/mold-source-calculate-shdr-osec-offset' },
        { title: 'mold源码阅读其十四 固定文件layout以及创建输出', link: '/docs/mold-source-fix-file-layout-and-create-output' },
      ],
    },
  ];

  return (
    <Layout title="文档导航" description="浏览我们的文档目录">
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.description}>
            这里主要记录了系列文章的索引，导航不会及时更新，请优先使用标签和分类功能查看内容。
          </p>
          {navItems.map((section, index) => (
            <NavigationItem key={index} {...section} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default NavigationPage;