/**
 * 聊天助手配置
 *
 * RAG 后端与站点同源,由 Cloudflare Worker(worker/index.js)提供,
 * 检索与生成托管在 Cloudflare AI Search(实例 kibou-rag)。
 */

const chatConfig = {
  // 同源 API 端点(SSE 流式)
  apiEndpoint: '/api/chat',

  // Docusaurus baseUrl(与 docusaurus.config.js 保持一致)
  baseUrl: '/',

  // UI 配置
  ui: {
    // 浮动按钮位置
    position: {
      bottom: '30px',
      right: '30px',
    },

    // 聊天窗口大小
    chatWindow: {
      width: '420px',
      height: '600px',
    },

    // 是否默认展开
    defaultOpen: false,
  },

  // 功能开关
  features: {
    // 是否显示检索范围切换
    showFilters: true,

    // 是否显示来源信息
    showSources: true,

    // 是否显示元数据(检索文档数、响应时间等)
    showMetadata: true,
  },
};

export default chatConfig;
