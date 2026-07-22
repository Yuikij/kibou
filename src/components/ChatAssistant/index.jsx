import React, { useState, useRef, useEffect } from 'react';
import styles from './styles.module.css';
import avatar from '@site/static/img/avatar.jpg';
import useChat from './useChat';
import ChatMessages from './ChatMessages';
import { SCOPES } from './utils';

const ChatAssistant = ({ apiEndpoint = '/api/chat' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [currentBubbleMessage, setCurrentBubbleMessage] = useState(0);
  const inputRef = useRef(null);

  const { messages, isLoading, scope, setScope, send, clear } = useChat(apiEndpoint);

  // 气泡消息列表
  const bubbleMessages = [
    'Hi! 有什么可以帮你的吗？',
    '可以问我博客里的内容哦',
    '有啥想跟我聊聊？',
    '来聊聊天吧~',
    '有问题尽管问我！',
    '我在这里等你哦~',
  ];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = () => {
    if (!inputValue.trim() || isLoading) return;
    send(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowNotification(false);
    }
  };

  // 自动切换气泡消息和隐藏通知
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentBubbleMessage((prev) => (prev + 1) % bubbleMessages.length);
    }, 5000);

    const hideTimer = setTimeout(() => {
      setShowNotification(false);
    }, 30000);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(hideTimer);
    };
  }, [bubbleMessages.length]);

  return (
    <>
      {/* 浮动按钮容器 */}
      <div className={styles.floatingButtonContainer}>
        {/* 消息气泡提示 */}
        {!isOpen && showNotification && (
          <div
            className={styles.messageBubble}
            onClick={() => setShowNotification(false)}
          >
            <div className={styles.bubbleContent}>
              <span className={styles.bubbleText}>{bubbleMessages[currentBubbleMessage]}</span>
            </div>
            <div className={styles.bubbleArrow}></div>
          </div>
        )}

        {/* 浮动按钮 - 使用头像 */}
        <button
          className={`${styles.floatingButton} ${isOpen ? styles.open : ''}`}
          onClick={toggleChat}
          aria-label="AI 智能助手"
        >
          <img
            src={avatar}
            alt="AI Assistant"
            className={styles.avatarImage}
          />
          {/* 在线状态指示器和发光效果 */}
          <div className={styles.statusIndicator}></div>
          <div className={styles.glowEffect}></div>
        </button>
      </div>

      {/* 聊天窗口 */}
      {isOpen && (
        <div className={styles.chatContainer}>
          {/* 头部 */}
          <div className={styles.chatHeader}>
            <div className={styles.headerLeft}>
              <h3 className={styles.chatTitle}>喵帕斯</h3>
              {messages.length > 0 && (
                <span className={styles.sessionIndicator}>会话中</span>
              )}
            </div>
            <div className={styles.headerActions}>
              <a
                className={styles.headerButton}
                href="/chat"
                title="在完整页面中打开"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
              <button
                className={styles.headerButton}
                onClick={() => setShowFilters(!showFilters)}
                title="检索范围"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
              </button>
              <button
                className={styles.headerButton}
                onClick={clear}
                title="清空对话"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* 检索范围面板 */}
          {showFilters && (
            <div className={styles.filterPanel}>
              <div className={styles.filterItem}>
                <label className={styles.filterLabel}>检索范围:</label>
                <div className={styles.scopeGroup}>
                  {SCOPES.map((item) => (
                    <button
                      key={item.value}
                      className={`${styles.scopeButton} ${scope === item.value ? styles.scopeButtonActive : ''}`}
                      onClick={() => setScope(item.value)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 消息列表 */}
          <ChatMessages messages={messages} />

          {/* 输入区域 */}
          <div className={styles.inputContainer}>
            <textarea
              ref={inputRef}
              className={styles.input}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入你的问题..."
              rows="1"
            />
            <button
              className={styles.sendButton}
              onClick={sendMessage}
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
      )}
    </>
  );
};

export default ChatAssistant;
