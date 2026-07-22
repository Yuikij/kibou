import chatConfig from '@site/src/config/chatConfig';

export const SCOPES = [
  { value: '', label: '全部' },
  { value: 'docs', label: '文档' },
  { value: 'blog', label: '博客' },
];

/**
 * 把回答里的 [n](模型看到的材料编号)换算成来源编号的引用链接
 * [k](#cite-k),相邻的重复引用只保留一个;模型编造的超范围编号直接剥掉。
 * 跳过普通 markdown 链接。
 */
export const renderCitations = (content, refMap) => {
  if (!content || !refMap || Object.keys(refMap).length === 0) return content;
  const maxRef = Math.max(...Object.keys(refMap).map(Number));
  let lastEnd = -1;
  let lastSource = 0;
  return content.replace(/\[(\d{1,2})\](?!\()/g, (match, num, offset) => {
    const source = refMap[num];
    if (!source) {
      // 超出材料数量的编号是幻觉引用,剥掉标记;更大的数字(如年份[2025])原样保留
      return Number(num) <= maxRef + 8 ? '' : match;
    }
    const isAdjacentDuplicate = offset === lastEnd && source === lastSource;
    lastEnd = offset + match.length;
    lastSource = source;
    return isAdjacentDuplicate ? '' : `[${source}](#cite-${source})`;
  });
};

/**
 * 来源跳转 URL:优先用同步时记录的真实 permalink(source.url),
 * 退化到按知识库文件路径猜测(docs/xxx.md、blog/YYYY-MM-DD-xxx.md)。
 */
export const sourceUrl = (source) => {
  if (!source) return null;
  if (source.url) return source.url;
  return convertFilePathToUrl(source.filePath);
};

export const convertFilePathToUrl = (filePath) => {
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

export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};
