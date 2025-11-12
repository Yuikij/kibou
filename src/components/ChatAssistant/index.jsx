import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import chatConfig from '@site/src/config/chatConfig';
import styles from './styles.module.css';
import avatar from '@site/static/img/avatar.jpg';

const ChatAssistant = ({ apiEndpoint = 'http://127.0.0.1:8080/api/v1/chat' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filePathFilter, setFilePathFilter] = useState('');
  const [fileExtensionFilter, setFileExtensionFilter] = useState('');
  const [showNotification, setShowNotification] = useState(true);
  const [currentBubbleMessage, setCurrentBubbleMessage] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 气泡消息列表
  const bubbleMessages = [
    "Hi! 有什么可以帮你的吗？",
    "需要帮助吗？",
    "有啥想跟我聊聊？",
    "来聊聊天吧~",
    "有问题尽管问我！",
    "我在这里等你哦~",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const requestBody = {
        question: inputValue,
      };

      // 添加 sessionId（如果存在）
      if (sessionId) {
        requestBody.sessionId = sessionId;
      }

      // 添加过滤器（如果有值）
      if (filePathFilter.trim()) {
        requestBody.filePathFilter = filePathFilter.trim();
      }
      if (fileExtensionFilter.trim()) {
        requestBody.fileExtensionFilter = fileExtensionFilter.trim();
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 更新 sessionId
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      const assistantMessage = {
        type: 'assistant',
        content: data.answer,
        sources: data.sources || [],
        metadata: data.metadata || {},
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        type: 'error',
        content: `发送消息时出错：${error.message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    setFilePathFilter('');
    setFileExtensionFilter('');
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowNotification(false);
    }
  };

  // 自动切换气泡消息和隐藏通知
  useEffect(() => {
    // 每5秒切换一次气泡消息
    const messageInterval = setInterval(() => {
      setCurrentBubbleMessage((prev) => (prev + 1) % bubbleMessages.length);
    }, 5000);

    // 30秒后隐藏气泡通知
    const hideTimer = setTimeout(() => {
      setShowNotification(false);
    }, 30000);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(hideTimer);
    };
  }, [bubbleMessages.length]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  // 将文件路径转换为 Docusaurus URL
  const convertFilePathToUrl = (filePath) => {
    if (!filePath) return null;

    const baseUrl = chatConfig.baseUrl || '/';
    // 确保 baseUrl 以 / 开头和结尾
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

    // 处理 blog 文章
    // blog/2025-03-17-两个人的话，去1912散步也是可以的.mdx -> /kibou/blog/2025/03/17/两个人的话，去1912散步也是可以的
    if (filePath.startsWith('blog/')) {
      const fileName = filePath.replace('blog/', '').replace(/\.(mdx?|md)$/, '');
      // 提取日期前缀 (YYYY-MM-DD-) 并转换为 /YYYY/MM/DD/ 格式
      const dateMatch = fileName.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);
      if (dateMatch) {
        const [, year, month, day, title] = dateMatch;
        return `${normalizedBaseUrl}blog/${year}/${month}/${day}/${title}`;
      }
      // 如果没有日期前缀，直接使用文件名
      return `${normalizedBaseUrl}blog/${fileName}`;
    }

    // 处理 docs 文档（支持多层嵌套）
    // docs/intro.md -> /kibou/docs/intro
    // docs/algorithm/index.mdx -> /kibou/docs/algorithm/
    // docs/basicKnowledge/framework/Mybatis/缓存.md -> /kibou/docs/basicKnowledge/framework/Mybatis/缓存
    if (filePath.startsWith('docs/')) {
      const docPath = filePath.replace('docs/', '').replace(/\.(mdx?|md)$/, '');
      return `${normalizedBaseUrl}docs/${docPath}`;
    }

    // 处理 documents 目录（可能是外部文档）
    if (filePath.startsWith('documents/')) {
      // 这种情况可能没有对应的页面，返回 null
      return null;
    }

    return null;
  };

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
              {sessionId && (
                <span className={styles.sessionIndicator} title={`会话ID: ${sessionId}`}>
                  会话中
                </span>
              )}
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.headerButton}
                onClick={() => setShowFilters(!showFilters)}
                title="过滤器"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
              </button>
              <button
                className={styles.headerButton}
                onClick={clearChat}
                title="清空对话"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* 过滤器面板 */}
          {showFilters && (
            <div className={styles.filterPanel}>
              <div className={styles.filterItem}>
                <label className={styles.filterLabel}>文件路径:</label>
                <input
                  type="text"
                  className={styles.filterInput}
                  value={filePathFilter}
                  onChange={(e) => setFilePathFilter(e.target.value)}
                  placeholder="/path/to/file.md"
                />
              </div>
              <div className={styles.filterItem}>
                <label className={styles.filterLabel}>文件扩展名:</label>
                <input
                  type="text"
                  className={styles.filterInput}
                  value={fileExtensionFilter}
                  onChange={(e) => setFileExtensionFilter(e.target.value)}
                  placeholder="md"
                />
              </div>
            </div>
          )}

          {/* 消息列表 */}
          <div className={styles.messagesContainer}>
            {messages.length === 0 ? (
              <div className={styles.emptyState}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <p>开始对话吧！</p>
                <span>支持多轮对话，我会记住上下文。</span>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`${styles.message} ${styles[message.type]}`}
                >
                  <div className={styles.messageContent}>
                    <div className={styles.messageText}>
                      {message.type === 'assistant' ? (
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      ) : (
                        message.content
                      )}
                    </div>
                    {message.type === 'assistant' && message.sources && message.sources.length > 0 && (
                      <div className={styles.sources}>
                        <div className={styles.sourcesTitle}>📚 参考来源：</div>
                        {message.sources.map((source, idx) => {
                          const url = convertFilePathToUrl(source.filePath);
                          return (
                            <div key={idx} className={styles.sourceItem}>
                              <div className={styles.sourceHeader}>
                                {url ? (
                                  <a 
                                    href={url} 
                                    className={styles.fileNameLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={`打开 ${source.fileName}`}
                                  >
                                    {source.fileName}
                                    <svg 
                                      width="12" 
                                      height="12" 
                                      viewBox="0 0 24 24" 
                                      fill="none" 
                                      stroke="currentColor" 
                                      strokeWidth="2"
                                      style={{ marginLeft: '4px', verticalAlign: 'middle' }}
                                    >
                                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                      <polyline points="15 3 21 3 21 9"></polyline>
                                      <line x1="10" y1="14" x2="21" y2="3"></line>
                                    </svg>
                                  </a>
                                ) : (
                                  <span className={styles.fileName}>{source.fileName}</span>
                                )}
                                {source.section && (
                                  <span className={styles.section}>{source.section}</span>
                                )}
                              </div>
                              {source.snippet && (
                                <div className={styles.snippet}>{source.snippet}</div>
                              )}
                              {source.filePath && (
                                <div className={styles.filePath} title={source.filePath}>
                                  {source.filePath}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {message.type === 'assistant' && message.metadata && (
                      <div className={styles.metadata}>
                        搜索了 {message.metadata.documentsSearched} 个文档 · 
                        耗时 {message.metadata.responseTimeMs}ms
                      </div>
                    )}
                  </div>
                  <div className={styles.messageTime}>
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.messageContent}>
                  <div className={styles.loadingDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

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
              disabled={isLoading}
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

