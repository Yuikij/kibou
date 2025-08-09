import React from 'react';
import Layout from '@theme/Layout';
import styles from './about.module.css';

export default function About() {
  const projects = [
    {
      title: 'Kibou Blog',
      description: '基于Docusaurus构建的个人技术博客，记录学习心得和技术分享',
      link: 'https://github.com/Yuikij/kibou',
      tech: ['React', 'Docusaurus', 'JavaScript'],
      image: '/kibou/img/avatar.jpg'
    },
    {
      title: 'Shiori',
      description: '个人项目管理和知识整理系统',
      link: '#',
      tech: ['Node.js', 'React', 'MongoDB'],
      image: '/kibou/img/avatar.jpg'
    }
  ];

  return (
    <Layout
      title="关于我"
      description="了解更多关于Yuikij的信息">
      <div className={styles.aboutContainer}>
        <div className={styles.hero}>
          <img 
            src="/kibou/img/avatar.jpg" 
            alt="Yuikij" 
            className={styles.avatar}
          />
          <h1>关于我</h1>
          <p className={styles.tagline}>おとといはウサギお见たの、昨日は鹿、今日はあなた</p>
        </div>

        <div className={styles.content}>
          <section className={styles.intro}>
            <h2>自我介绍</h2>
            <p>
              你好！我是Yuikij，一名热爱技术的开发者。我专注于全栈开发，
              对算法、数据结构、分布式系统等领域有浓厚兴趣。
            </p>
            <p>
              除了编程，我还热爱学习语言（特别是日语），喜欢阅读和思考。
              这个博客记录了我的学习历程、技术心得和生活感悟。
            </p>
          </section>

          <section className={styles.projects}>
            <h2>个人项目</h2>
            <div className={styles.projectGrid}>
              {projects.map((project, index) => (
                <div key={index} className={styles.projectCard}>
                  {project.image && (
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className={styles.projectImage}
                    />
                  )}
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className={styles.techStack}>
                    {project.tech.map((tech, techIndex) => (
                      <span key={techIndex} className={styles.techTag}>
                        {tech}
                      </span>
                    ))}
                  </div>
                  {project.link !== '#' && (
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.projectLink}
                    >
                      查看项目 →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className={styles.contact}>
            <h2>联系方式</h2>
            <p>
              如果你想与我交流技术或其他话题，欢迎通过以下方式联系我：
            </p>
            <ul>
              <li>GitHub: <a href="https://github.com/Yuikij" target="_blank" rel="noopener noreferrer">@Yuikij</a></li>
              <li>Email: 可通过GitHub联系</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
}