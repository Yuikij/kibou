/**
 * 聊天助手配置
 * 
 * 在这里可以配置 RAG 聊天服务的各项参数
 */

const chatConfig = {
  // API 端点配置
  apiEndpoint: 'http://127.0.0.1:8080/api/v1/chat',
  
  // Docusaurus baseUrl（根据 docusaurus.config.js 中的 baseUrl 配置）
  // 如果你的网站部署在根目录，设置为 '/'
  // 如果部署在子路径（如 GitHub Pages），设置为对应的路径（如 '/kibou/'）
  baseUrl: '/kibou/',
  
  // 默认过滤器（可选）
  defaultFilters: {
    filePathFilter: '',
    fileExtensionFilter: '',
  },
  
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
    // 是否显示过滤器
    showFilters: true,
    
    // 是否显示来源信息
    showSources: true,
    
    // 是否显示元数据（搜索文档数、响应时间等）
    showMetadata: true,
  },
};

export default chatConfig;

