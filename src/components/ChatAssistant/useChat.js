import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * RAG 聊天的核心逻辑:消息状态、SSE 流解析、多轮历史。
 * 浮窗和 /chat 页面共用。
 */
export default function useChat(apiEndpoint = '/api/chat') {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scope, setScope] = useState('');
  const abortRef = useRef(null);

  // 组件卸载时中断进行中的请求
  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(
    async (text) => {
      const question = (text ?? '').trim();
      if (!question || isLoading) return;

      const userMessage = {
        type: 'user',
        content: question,
        timestamp: new Date().toISOString(),
      };

      // 发送给后端的历史:只保留正常的 user/assistant 消息
      const history = [...messages, userMessage]
        .filter((m) => m.type === 'user' || (m.type === 'assistant' && m.content))
        .map((m) => ({ role: m.type, content: m.content }));

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      const startedAt = Date.now();
      const controller = new AbortController();
      abortRef.current = controller;

      // 占位的助手消息,流式填充
      setMessages((prev) => [
        ...prev,
        {
          type: 'assistant',
          content: '',
          sources: [],
          refMap: {},
          metadata: null,
          timestamp: new Date().toISOString(),
          streaming: true,
        },
      ]);

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
              const parsed = JSON.parse(data);
              const payload = Array.isArray(parsed) ? { sources: parsed, refMap: {} } : parsed;
              patchAssistant({ sources: payload.sources ?? [], refMap: payload.refMap ?? {} });
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
    },
    [apiEndpoint, isLoading, messages, scope],
  );

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setIsLoading(false);
  }, []);

  return { messages, isLoading, scope, setScope, send, clear };
}
