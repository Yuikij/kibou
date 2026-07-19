import React from 'react';
import ChatAssistant from '@site/src/components/ChatAssistant';
import chatConfig from '@site/src/config/chatConfig';

// 默认实现,将 children 渲染出来
export default function Root({ children }) {
  return (
    <>
      {children}
      <ChatAssistant apiEndpoint={chatConfig.apiEndpoint} />
    </>
  );
}
