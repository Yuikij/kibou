import React from 'react';
import Layout from '@theme/Layout';
import styles from './chat-demo.module.css';

export default function ChatDemo() {
  return (
    <Layout
      title="聊天助手演示"
      description="展示如何使用 RAG 聊天助手"
    >
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1>🤖 RAG 聊天助手</h1>
          <p className={styles.subtitle}>
            基于检索增强生成（RAG）技术的智能文档助手
          </p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>✨ 功能特性</h2>
            <div className={styles.features}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>💬</div>
                <h3>多轮对话</h3>
                <p>支持连续对话，自动维护上下文，让交流更自然</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🔍</div>
                <h3>智能检索</h3>
                <p>从文档库中精准检索相关内容，提供准确答案</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>📚</div>
                <h3>来源追溯</h3>
                <p>显示答案的参考来源，让信息可追溯、可验证</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🎨</div>
                <h3>主题适配</h3>
                <p>自动适配浅色和深色主题，提供舒适的视觉体验</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🔧</div>
                <h3>灵活过滤</h3>
                <p>支持按文件路径和扩展名过滤，精准定位信息</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>📱</div>
                <h3>响应式设计</h3>
                <p>完美适配手机、平板和桌面设备</p>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>🚀 快速开始</h2>
            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h3>启动后端服务</h3>
                  <p>确保你的 RAG 服务正在运行</p>
                  <pre className={styles.code}>
                    {`# 默认端口 8080
http://127.0.0.1:8080/api/v1/chat`}
                  </pre>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h3>点击浮动按钮</h3>
                  <p>在页面右下角找到聊天图标按钮</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h3>开始对话</h3>
                  <p>输入你的问题，助手会从文档库中检索相关内容并回答</p>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>💡 使用技巧</h2>
            <div className={styles.tips}>
              <div className={styles.tip}>
                <strong>多轮对话：</strong>
                你可以连续提问，助手会记住之前的对话内容。例如先问"什么是 chunk size？"，
                再问"它的默认值是多少？"，助手能理解"它"指的是 chunk size。
              </div>
              <div className={styles.tip}>
                <strong>使用过滤器：</strong>
                点击头部的过滤器图标，可以限制搜索范围。比如只在特定目录或特定类型的文件中搜索。
              </div>
              <div className={styles.tip}>
                <strong>查看来源：</strong>
                每个回答下方都会显示参考来源，包括文件名、章节和相关片段，
                帮助你验证信息的准确性。
              </div>
              <div className={styles.tip}>
                <strong>清空对话：</strong>
                点击头部的垃圾桶图标可以清空当前对话，开始新的会话。
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>🎯 示例对话</h2>
            <div className={styles.examples}>
              <div className={styles.example}>
                <div className={styles.exampleQuestion}>
                  问：讲一下桂林之行
                </div>
                <div className={styles.exampleAnswer}>
                  答：根据提供的资料，这次桂林之行发生在十一国庆节前几天，作者从南京出发，
                  出发当天恰逢中秋节...
                  <div className={styles.exampleMeta}>
                    参考来源：documents/example.md
                  </div>
                </div>
              </div>
              <div className={styles.example}>
                <div className={styles.exampleQuestion}>
                  问：天气怎么样？
                </div>
                <div className={styles.exampleAnswer}>
                  答：根据前面的描述，出发那天台风刚过南京，还下着雨。
                  到阳朔游览漓江时，天气不错。
                  <div className={styles.exampleMeta}>
                    （多轮对话示例 - 理解上下文）
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>⚙️ 配置说明</h2>
            <p>
              可以在 <code>src/config/chatConfig.js</code> 中自定义配置：
            </p>
            <ul className={styles.configList}>
              <li><strong>apiEndpoint:</strong> RAG 服务的 API 地址</li>
              <li><strong>defaultFilters:</strong> 默认的过滤器设置</li>
              <li><strong>ui.position:</strong> 浮动按钮的位置</li>
              <li><strong>ui.chatWindow:</strong> 聊天窗口的大小</li>
              <li><strong>features:</strong> 功能开关（过滤器、来源、元数据等）</li>
            </ul>
          </section>

          <section className={styles.callToAction}>
            <h2>现在就试试吧！</h2>
            <p>点击右下角的聊天按钮，开始与文档助手对话 👉</p>
          </section>
        </div>
      </div>
    </Layout>
  );
}

