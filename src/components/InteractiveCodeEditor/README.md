# InteractiveCodeEditor

一个交互式代码编辑器组件，支持在浏览器中编辑、运行 JavaScript 代码，并查看输出结果。

## 特性

- 📝 基于 CodeMirror 6 的代码编辑器，支持语法高亮与活动行高亮
- ⚡ 内置智能补全（输入时或按 `Ctrl + Space` 触发）、括号匹配与多光标
- ▶️ 运行代码并捕获 `console.log` 输出
- 🔍 支持表达式求值，可以直接查看函数调用结果
- 🌗 自动适配明暗主题，风格与 Docusaurus 主题协调
- 📱 响应式设计，支持移动端

## 使用方法

### 在 React/JSX 页面中使用

```jsx
import InteractiveCodeEditor from '@site/src/components/InteractiveCodeEditor';

function MyPage() {
  const defaultCode = `function bubbleSort(arr) {
  const a = arr.slice();
  const n = a.length;
  let swapped;
  
  for (let i = 0; i < n - 1; i++) {
    swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return a;
}

console.log(bubbleSort([5, 2, 8, 1, 9]));`;

  return (
    <div>
      <h1>冒泡排序算法</h1>
      <InteractiveCodeEditor 
        defaultCode={defaultCode}
        height="400px"
      />
    </div>
  );
}
```

### 在 MDX 文档中使用

```mdx
---
title: 排序算法
---

import InteractiveCodeEditor from '@site/src/components/InteractiveCodeEditor';

# 冒泡排序

冒泡排序是一种简单的排序算法。

export const bubbleSortCode = `function bubbleSort(arr) {
  const a = arr.slice();
  const n = a.length;
  let swapped;
  
  for (let i = 0; i < n - 1; i++) {
    swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return a;
}

console.log(bubbleSort([5, 2, 8, 1, 9]));`;

<InteractiveCodeEditor 
  defaultCode={bubbleSortCode}
  height="450px"
/>

试试在"输出"框中输入 `bubbleSort([3, 1, 2])` 查看结果！
```

## Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `defaultCode` | `string` | `''` | 编辑器的默认代码内容 |
| `height` | `string` | `'400px'` | 编辑器的高度 |
| `readOnly` | `boolean` | `false` | 是否只读模式 |
| `showLineNumbers` | `boolean` | `true` | 是否显示行号 |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | 主题模式，`auto` 会自动跟随 Docusaurus 主题 |

## 使用提示

### 运行代码
1. 在编辑器中编写或修改代码
2. 点击"运行代码"按钮
3. 在"控制台输出"区域查看 `console.log` 的输出

### 表达式求值
1. 运行代码后，在"输出"输入框中输入表达式
2. 例如：`bubbleSort([3, 1, 2])`
3. 点击"执行"按钮或按回车键
4. 结果会显示在下方

## 示例算法

### 快速排序

```javascript
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];
  
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }
  
  return [...quickSort(left), pivot, ...quickSort(right)];
}

console.log(quickSort([5, 2, 8, 1, 9]));
```

### 二分查找

```javascript
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}

const sortedArr = [1, 2, 3, 5, 7, 8, 9];
console.log('查找 5 的位置:', binarySearch(sortedArr, 5));
console.log('查找 4 的位置:', binarySearch(sortedArr, 4));
```

## 技术细节

- 使用 CodeMirror 6 作为编辑器核心
- 使用 `Function` 构造函数执行用户代码
- 重写 `console` 对象来捕获输出
- 支持 Docusaurus 的明暗主题切换

## 注意事项

⚠️ 代码在浏览器中执行，请注意：
- 不要运行死循环代码，会导致浏览器卡死
- 不要运行恶意代码
- 复杂的算法可能需要一些时间执行

