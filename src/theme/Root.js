import React from 'react';
import { useLocation } from '@docusaurus/router';
import ChatAssistant from '@site/src/components/ChatAssistant';
import chatConfig from '@site/src/config/chatConfig';

// 默认实现,将 children 渲染出来
export default function Root({ children }) {
  const { pathname } = useLocation();
  // /chat 页面本身就是完整聊天界面,不再叠加浮窗
  const isChatPage = pathname === '/chat' || pathname === '/chat/';

  return (
    <>
      {children}
      {!isChatPage && <ChatAssistant apiEndpoint={chatConfig.apiEndpoint} />}
    </>
  );
}
