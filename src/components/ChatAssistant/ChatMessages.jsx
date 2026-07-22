import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './styles.module.css';
import { renderCitations, sourceUrl, formatTimestamp } from './utils';

/** 带行内引用角标的 markdown 渲染 */
function AssistantMarkdown({ message }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node, href, children, ...props }) => {
          const cite = href?.match(/^#cite-(\d+)$/);
          if (cite) {
            const idx = Number(cite[1]);
            const source = message.sources?.[idx - 1];
            const url = sourceUrl(source);
            return (
              <a
                className={styles.citation}
                href={url ?? '#'}
                target={url ? '_blank' : undefined}
                rel="noopener noreferrer"
                title={source?.fileName}
                onClick={url ? undefined : (e) => e.preventDefault()}
              >
                {idx}
              </a>
            );
          }
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          );
        },
      }}
    >
      {renderCitations(message.content, message.refMap)}
    </ReactMarkdown>
  );
}

/** 来源纸片列表:显示在回答上方,与行内角标编号一致 */
function SourceChips({ sources }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div className={styles.sourceChips}>
      {sources.map((source, idx) => {
        const url = sourceUrl(source);
        const name = (source.fileName ?? '').replace(/\.(mdx?|md)$/, '');
        const chip = (
          <>
            <span className={styles.sourceChipNum}>{idx + 1}</span>
            <span className={styles.sourceChipName}>{name}</span>
          </>
        );
        return url ? (
          <a
            key={idx}
            className={styles.sourceChip}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={source.snippet ? `${source.filePath}\n\n${source.snippet}` : source.filePath}
          >
            {chip}
          </a>
        ) : (
          <span key={idx} className={styles.sourceChip} title={source.filePath}>
            {chip}
          </span>
        );
      })}
    </div>
  );
}

/**
 * 消息列表(滚动容器)。
 * 智能滚动:仅当用户本来就停留在底部附近时才跟随新内容滚动,
 * 用户往上翻阅时不打断。
 */
export default function ChatMessages({ messages, className, emptyHint, suggestions, onSuggestion }) {
  const containerRef = useRef(null);
  const nearBottomRef = useRef(true);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el && nearBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`${styles.messagesContainer} ${className ?? ''}`}
    >
      {messages.length === 0 ? (
        <div className={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <p>开始对话吧！</p>
          <span>{emptyHint ?? '我会检索博客内容来回答,也支持多轮追问。'}</span>
          {suggestions && suggestions.length > 0 && (
            <div className={styles.suggestions}>
              {suggestions.map((question) => (
                <button
                  key={question}
                  className={styles.suggestionButton}
                  onClick={() => onSuggestion?.(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        messages.map((message, index) => (
          <div key={index} className={`${styles.message} ${styles[message.type]}`}>
            <div className={styles.messageContent}>
              {/* 来源置顶:流式输出时答案在气泡底部增长,滚动跟随可见 */}
              {message.type === 'assistant' && <SourceChips sources={message.sources} />}
              <div className={styles.messageText}>
                {message.type === 'assistant' ? (
                  message.content ? (
                    <AssistantMarkdown message={message} />
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
              {message.type === 'assistant' && message.metadata && (
                <div className={styles.metadata}>
                  检索到 {message.metadata.documentsSearched} 篇相关内容 ·
                  耗时 {message.metadata.responseTimeMs}ms
                </div>
              )}
            </div>
            <div className={styles.messageTime}>{formatTimestamp(message.timestamp)}</div>
          </div>
        ))
      )}
    </div>
  );
}
