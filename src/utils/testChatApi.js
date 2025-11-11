/**
 * RAG 聊天 API 测试工具
 * 
 * 用于测试 RAG 服务是否正常运行
 * 使用方法：在浏览器控制台运行 testChatConnection()
 */

export const testChatConnection = async (apiEndpoint = 'http://127.0.0.1:8080/api/v1/chat') => {
  console.log('🔍 开始测试 RAG API 连接...');
  console.log(`API 端点: ${apiEndpoint}`);
  
  try {
    const testQuestion = '你好';
    
    console.log(`📤 发送测试消息: "${testQuestion}"`);
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: testQuestion,
      }),
    });

    console.log(`📊 响应状态: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ API 连接成功！');
    console.log('📝 响应数据:', {
      answer: data.answer,
      sessionId: data.sessionId,
      sourcesCount: data.sources?.length || 0,
      metadata: data.metadata,
    });
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ API 连接失败！');
    console.error('错误信息:', error.message);
    
    // 提供故障排查建议
    console.log('\n🔧 故障排查建议:');
    console.log('1. 检查 RAG 服务是否已启动');
    console.log('2. 确认 API 端点地址是否正确');
    console.log('3. 检查 CORS 配置（跨域问题）');
    console.log('4. 查看服务器日志获取详细错误信息');
    
    return {
      success: false,
      error: error.message,
    };
  }
};

// 多轮对话测试
export const testMultiTurnChat = async (apiEndpoint = 'http://127.0.0.1:8080/api/v1/chat') => {
  console.log('🔄 开始测试多轮对话功能...');
  
  try {
    // 第一轮对话
    console.log('\n📤 第一轮: "什么是 chunk size?"');
    const firstResponse = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: '什么是 chunk size?' }),
    });
    
    const firstData = await firstResponse.json();
    console.log('📝 第一轮响应:', {
      sessionId: firstData.sessionId,
      answerPreview: firstData.answer.substring(0, 100) + '...',
    });

    // 第二轮对话（使用相同的 sessionId）
    console.log('\n📤 第二轮: "它的默认值是多少?" (使用 sessionId)');
    const secondResponse = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: '它的默认值是多少?',
        sessionId: firstData.sessionId,
      }),
    });
    
    const secondData = await secondResponse.json();
    console.log('📝 第二轮响应:', {
      sessionId: secondData.sessionId,
      answerPreview: secondData.answer.substring(0, 100) + '...',
    });

    console.log('\n✅ 多轮对话测试成功！');
    console.log(`会话 ID 保持一致: ${firstData.sessionId === secondData.sessionId}`);
    
    return { success: true };
  } catch (error) {
    console.error('❌ 多轮对话测试失败:', error.message);
    return { success: false, error: error.message };
  }
};

// 过滤器测试
export const testFilters = async (apiEndpoint = 'http://127.0.0.1:8080/api/v1/chat') => {
  console.log('🔍 开始测试过滤器功能...');
  
  try {
    console.log('\n📤 测试文件扩展名过滤: fileExtensionFilter="md"');
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: '测试问题',
        fileExtensionFilter: 'md',
      }),
    });
    
    const data = await response.json();
    console.log('📝 响应:', {
      sourcesCount: data.sources?.length || 0,
      sources: data.sources?.map(s => s.fileName),
    });

    console.log('\n✅ 过滤器测试完成！');
    return { success: true, data };
  } catch (error) {
    console.error('❌ 过滤器测试失败:', error.message);
    return { success: false, error: error.message };
  }
};

// 运行所有测试
export const runAllTests = async (apiEndpoint) => {
  console.log('🚀 开始运行完整测试套件...\n');
  console.log('='.repeat(60));
  
  const results = {
    connection: await testChatConnection(apiEndpoint),
    multiTurn: await testMultiTurnChat(apiEndpoint),
    filters: await testFilters(apiEndpoint),
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 测试结果汇总:');
  console.log(`  连接测试: ${results.connection.success ? '✅' : '❌'}`);
  console.log(`  多轮对话: ${results.multiTurn.success ? '✅' : '❌'}`);
  console.log(`  过滤器: ${results.filters.success ? '✅' : '❌'}`);
  
  const allSuccess = Object.values(results).every(r => r.success);
  console.log(`\n总体结果: ${allSuccess ? '✅ 全部通过' : '❌ 部分失败'}`);
  
  return results;
};

// 在浏览器控制台中可用的全局函数
if (typeof window !== 'undefined') {
  window.testChatAPI = {
    testConnection: testChatConnection,
    testMultiTurn: testMultiTurnChat,
    testFilters,
    runAll: runAllTests,
  };
  
  console.log('💡 测试工具已加载！使用方法:');
  console.log('  window.testChatAPI.testConnection()      - 测试 API 连接');
  console.log('  window.testChatAPI.testMultiTurn()       - 测试多轮对话');
  console.log('  window.testChatAPI.testFilters()         - 测试过滤器');
  console.log('  window.testChatAPI.runAll()              - 运行所有测试');
}

export default {
  testChatConnection,
  testMultiTurnChat,
  testFilters,
  runAllTests,
};

