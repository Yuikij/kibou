import React, { useState } from 'react';
import Layout from '@theme/Layout';
import InteractiveCodeEditor from '@site/src/components/InteractiveCodeEditor';
import styles from './algorithm-playground.module.css';

// 算法示例代码
const algorithms = {
  bubbleSort: {
    name: '冒泡排序',
    description: '冒泡排序是一种简单的排序算法。它重复地遍历要排序的数列，一次比较两个元素，如果它们的顺序错误就交换过来。',
    complexity: '时间复杂度: O(n²) | 空间复杂度: O(1)',
    code: `function bubbleSort(arr) {
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
    if (!swapped) break; // 已有序提早结束
  }
  return a;
}

console.log('排序结果:', bubbleSort([5, 2, 8, 1, 9, 3]));`,
    testExpression: 'bubbleSort([3, 1, 2])'
  },
  quickSort: {
    name: '快速排序',
    description: '快速排序使用分治法策略来把一个序列分为较小和较大的2个子序列，然后递归地排序两个子序列。',
    complexity: '时间复杂度: O(n log n) | 空间复杂度: O(log n)',
    code: `function quickSort(arr) {
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

console.log('排序结果:', quickSort([5, 2, 8, 1, 9, 3]));`,
    testExpression: 'quickSort([9, 7, 5, 3, 1])'
  },
  binarySearch: {
    name: '二分查找',
    description: '二分查找也称折半查找，是一种在有序数组中查找某一特定元素的搜索算法。',
    complexity: '时间复杂度: O(log n) | 空间复杂度: O(1)',
    code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    console.log(\`检查位置 \${mid}, 值为 \${arr[mid]}\`);
    
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

const sortedArr = [1, 2, 3, 5, 7, 8, 9, 11, 13, 15];
console.log('查找 7 的位置:', binarySearch(sortedArr, 7));
console.log('查找 4 的位置:', binarySearch(sortedArr, 4));`,
    testExpression: 'binarySearch([1, 2, 3, 5, 7, 8, 9], 5)'
  },
  dijkstra: {
    name: 'Dijkstra 最短路径',
    description: 'Dijkstra算法用于计算一个节点到其他所有节点的最短路径，适用于边权重非负的图。',
    complexity: '时间复杂度: O(V²) 或 O(E + V log V) | 空间复杂度: O(V)',
    code: `function dijkstra(graph, start) {
  const distances = {};
  const visited = new Set();
  const nodes = Object.keys(graph);
  
  // 初始化距离
  nodes.forEach(node => {
    distances[node] = node === start ? 0 : Infinity;
  });
  
  while (visited.size < nodes.length) {
    // 找到未访问节点中距离最小的
    let minNode = null;
    let minDistance = Infinity;
    
    for (const node of nodes) {
      if (!visited.has(node) && distances[node] < minDistance) {
        minNode = node;
        minDistance = distances[node];
      }
    }
    
    if (minNode === null) break;
    
    visited.add(minNode);
    console.log(\`访问节点 \${minNode}, 当前距离: \${distances[minNode]}\`);
    
    // 更新邻居节点的距离
    for (const neighbor in graph[minNode]) {
      const newDistance = distances[minNode] + graph[minNode][neighbor];
      if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance;
      }
    }
  }
  
  return distances;
}

// 图的邻接表表示 (节点: {邻居: 权重})
const graph = {
  'A': {'B': 4, 'C': 2},
  'B': {'A': 4, 'C': 1, 'D': 5},
  'C': {'A': 2, 'B': 1, 'D': 8, 'E': 10},
  'D': {'B': 5, 'C': 8, 'E': 2},
  'E': {'C': 10, 'D': 2}
};

console.log('从节点 A 到所有节点的最短距离:');
console.log(dijkstra(graph, 'A'));`,
    testExpression: 'dijkstra(graph, "B")'
  },
  mergeSort: {
    name: '归并排序',
    description: '归并排序采用分治法，将已有序的子序列合并，得到完全有序的序列。',
    complexity: '时间复杂度: O(n log n) | 空间复杂度: O(n)',
    code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }
  
  return result.concat(left.slice(i)).concat(right.slice(j));
}

console.log('排序结果:', mergeSort([5, 2, 8, 1, 9, 3]));`,
    testExpression: 'mergeSort([64, 34, 25, 12, 22, 11, 90])'
  },
  fibonacci: {
    name: '斐波那契数列 (动态规划)',
    description: '使用动态规划优化斐波那契数列计算，避免重复计算。',
    complexity: '时间复杂度: O(n) | 空间复杂度: O(n)',
    code: `function fibonacci(n) {
  if (n <= 1) return n;
  
  const dp = [0, 1];
  
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    console.log(\`F(\${i}) = \${dp[i]}\`);
  }
  
  return dp[n];
}

console.log('斐波那契数列第10项:', fibonacci(10));`,
    testExpression: 'fibonacci(15)'
  }
};

export default function AlgorithmPlayground() {
  const [selectedAlgo, setSelectedAlgo] = useState('bubbleSort');
  const currentAlgo = algorithms[selectedAlgo];

  return (
    <Layout
      title="算法演练场"
      description="交互式学习和测试常见算法"
    >
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>🧪 算法演练场</h1>
          <p className={styles.subtitle}>
            在浏览器中直接编辑、运行和测试各种算法
          </p>
        </header>

        <div className={styles.content}>
          <aside className={styles.sidebar}>
            <h3>选择算法</h3>
            <nav className={styles.algoList}>
              {Object.entries(algorithms).map(([key, algo]) => (
                <button
                  key={key}
                  className={`${styles.algoButton} ${
                    selectedAlgo === key ? styles.active : ''
                  }`}
                  onClick={() => setSelectedAlgo(key)}
                >
                  {algo.name}
                </button>
              ))}
            </nav>
          </aside>

          <main className={styles.main}>
            <div className={styles.algoInfo}>
              <h2>{currentAlgo.name}</h2>
              <p className={styles.description}>{currentAlgo.description}</p>
              <p className={styles.complexity}>{currentAlgo.complexity}</p>
            </div>

            <InteractiveCodeEditor
              key={selectedAlgo}
              defaultCode={currentAlgo.code}
              height="450px"
            />

            <div className={styles.hint}>
              <strong>💡 提示：</strong> 
              点击"运行代码"查看 console.log 输出，
              或在"输出"框中输入表达式，如：
              <code>{currentAlgo.testExpression}</code>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
}

