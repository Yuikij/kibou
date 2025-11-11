import React, { useEffect } from 'react';
import ChatAssistant from '@site/src/components/ChatAssistant';
import chatConfig from '@site/src/config/chatConfig';

// 默认实现，将 children 渲染出来
export default function Root({ children }) {
  // 在开发环境中加载测试工具
  useEffect(() => {
    // 测试工具已经在 testChatApi.js 中自动注册到 window
    console.log('💡 RAG 聊天助手已加载');
    console.log('💡 API 端点:', chatConfig.apiEndpoint);
    console.log('💡 在控制台运行 window.testChatAPI.testConnection() 测试连接');
  }, []);

  return (
    <>
      {children}
      <ChatAssistant apiEndpoint={chatConfig.apiEndpoint} />
    </>
  );
}

