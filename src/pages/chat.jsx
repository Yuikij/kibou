import React, { useState, useRef, useEffect } from 'react';
import Layout from '@theme/Layout';
import useChat from '@site/src/components/ChatAssistant/useChat';
import ChatMessages from '@site/src/components/ChatAssistant/ChatMessages';
import { SCOPES } from '@site/src/components/ChatAssistant/utils';
import widgetStyles from '@site/src/components/ChatAssistant/styles.module.css';
import styles from './chat.module.css';

const SUGGESTIONS = [
  '博客里怎么讲 MySQL 的事务隔离级别?',
  '站内整理过哪些上站和 SEO 的经验?',
  'Agent 的记忆系统有哪些设计思路?',
  '关西之行都去了哪些地方?',
];

export default function ChatPage() {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const { messages, isLoading, scope, setScope, send, clear } = useChat('/api/chat');

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = (text) => {
    const question = (text ?? inputValue).trim();
    if (!question || isLoading) return;
    send(question);
    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Layout title="AI 问答" description="基于博客内容的 RAG 问答助手">
      <div className={styles.page}>
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <h1 className={styles.title}>喵帕斯</h1>
            <span className={styles.subtitle}>基于全站内容检索作答,支持多轮追问</span>
          </div>
          <div className={styles.toolbarRight}>
            <div className={widgetStyles.scopeGroup}>
              {SCOPES.map((item) => (
                <button
                  key={item.value}
                  className={`${widgetStyles.scopeButton} ${scope === item.value ? widgetStyles.scopeButtonActive : ''}`}
                  onClick={() => setScope(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              className={styles.clearButton}
              onClick={clear}
              disabled={messages.length === 0}
              title="清空对话"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              清空
            </button>
          </div>
        </div>

        <ChatMessages
          messages={messages}
          className={styles.pageMessages}
          emptyHint="回答基于检索到的博客原文,并附可点击的来源引用。"
          suggestions={SUGGESTIONS}
          onSuggestion={(question) => sendMessage(question)}
        />

        <div className={styles.inputBar}>
          <textarea
            ref={inputRef}
            className={widgetStyles.input}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入你的问题,Enter 发送,Shift+Enter 换行"
            rows="1"
          />
          <button
            className={widgetStyles.sendButton}
            onClick={() => sendMessage()}
            disabled={!inputValue.trim() || isLoading}
            aria-label="发送消息"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </Layout>
  );
}
