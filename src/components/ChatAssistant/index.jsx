import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import chatConfig from '@site/src/config/chatConfig';
import styles from './styles.module.css';
import avatar from '@site/static/img/avatar.jpg';

const SCOPES = [
  { value: '', label: '全部' },
  { value: 'docs', label: '文档' },
  { value: 'blog', label: '博客' },
];

const ChatAssistant = ({ apiEndpoint = '/api/chat' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [scope, setScope] = useState('');
  const [showNotification, setShowNotification] = useState(true);
  const [currentBubbleMessage, setCurrentBubbleMessage] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  // 气泡消息列表
  const bubbleMessages = [
    'Hi! 有什么可以帮你的吗？',
    '可以问我博客里的内容哦',
    '有啥想跟我聊聊？',
    '来聊聊天吧~',
    '有问题尽管问我！',
    '我在这里等你哦~',
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

  // 组件卸载时中断进行中的请求
  useEffect(() => () => abortRef.current?.abort(), []);

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    // 发送给后端的历史:只保留正常的 user/assistant 消息
    const history = [...messages, userMessage]
      .filter((m) => m.type === 'user' || (m.type === 'assistant' && m.content))
      .map((m) => ({ role: m.type, content: m.content }));

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const startedAt = Date.now();
    const controller = new AbortController();
    abortRef.current = controller;

    // 占位的助手消息,流式填充
    const assistantMessage = {
      type: 'assistant',
      content: '',
      sources: [],
      metadata: null,
      timestamp: new Date().toISOString(),
      streaming: true,
    };
    setMessages((prev) => [...prev, assistantMessage]);

    const patchAssistant = (patch) => {
      setMessages((prev) => {
        const next = [...prev];
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].type === 'assistant') {
            next[i] = { ...next[i], ...(typeof patch === 'function' ? patch(next[i]) : patch) };
            break;
          }
        }
        return next;
      });
    };

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, ...(scope ? { scope } : {}) }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let detail = `HTTP ${response.status}`;
        try {
          const err = await response.json();
          if (err?.error) detail = err.error;
        } catch {
          // 忽略解析失败
        }
        throw new Error(detail);
      }

      // 解析 SSE 流
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const handleEvent = (rawEvent) => {
        let eventName = '';
        let data = '';
        for (const line of rawEvent.split('\n')) {
          if (line.startsWith('event:')) eventName = line.slice(6).trim();
          else if (line.startsWith('data:')) data += line.slice(5).trim();
        }
        if (!data || data === '[DONE]') return;
        if (eventName === 'sources') {
          try {
            patchAssistant({ sources: JSON.parse(data) });
          } catch {
            // 忽略
          }
          return;
        }
        try {
          const parsed = JSON.parse(data);
          if (parsed.delta) {
            patchAssistant((m) => ({ content: m.content + parsed.delta }));
          }
        } catch {
          // 忽略
        }
      };

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';
        events.forEach(handleEvent);
      }
      if (buffer.trim()) handleEvent(buffer);

      patchAssistant((m) => ({
        streaming: false,
        content: m.content || '(没有生成回答,请换个问法试试)',
        metadata: {
          documentsSearched: m.sources?.length ?? 0,
          responseTimeMs: Date.now() - startedAt,
        },
      }));
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error('Error sending message:', error);
      // 移除空的占位消息,追加错误提示
      setMessages((prev) => {
        const next = prev.filter((m) => !(m.type === 'assistant' && m.streaming && !m.content));
        return [
          ...next,
          {
            type: 'error',
            content: `发送消息时出错：${error.message}`,
            timestamp: new Date().toISOString(),
          },
        ];
      });
    } finally {
      abortRef.current = null;
      setIsLoading(false);
    }
  }, [apiEndpoint, inputValue, isLoading, messages, scope]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setIsLoading(false);
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

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  // 将知识库文件路径(docs/xxx.md、blog/YYYY-MM-DD-xxx.md)转换为站内 URL
  const convertFilePathToUrl = (filePath) => {
    if (!filePath) return null;

    const baseUrl = chatConfig.baseUrl || '/';
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

    if (filePath.startsWith('blog/')) {
      const fileName = filePath.replace('blog/', '').replace(/\.(mdx?|md)$/, '');
      const dateMatch = fileName.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);
      if (dateMatch) {
        const [, year, month, day, title] = dateMatch;
        return encodeURI(`${normalizedBaseUrl}blog/${year}/${month}/${day}/${title}`);
      }
      return encodeURI(`${normalizedBaseUrl}blog/${fileName}`);
    }

    if (filePath.startsWith('docs/')) {
      let docPath = filePath.replace('docs/', '').replace(/\.(mdx?|md)$/, '');
      // index/README 以及与目录同名的文件是分类首页,链接到目录
      const segments = docPath.split('/');
      const last = segments[segments.length - 1];
      const parent = segments.length > 1 ? segments[segments.length - 2] : null;
      if (last === 'index' || last === 'README' || (parent && last === parent)) {
        docPath = segments.slice(0, -1).join('/');
      }
      return encodeURI(`${normalizedBaseUrl}docs/${docPath}`);
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
              {messages.length > 0 && (
                <span className={styles.sessionIndicator}>会话中</span>
              )}
            </div>
            <div className={styles.headerActions}>
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
          <div className={styles.messagesContainer}>
            {messages.length === 0 ? (
              <div className={styles.emptyState}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <p>开始对话吧！</p>
                <span>我会检索博客内容来回答,也支持多轮追问。</span>
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
                        message.content ? (
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        ) : (
                          <div className={styles.loadingDots}>
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        )
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
                        检索到 {message.metadata.documentsSearched} 篇相关内容 ·
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
