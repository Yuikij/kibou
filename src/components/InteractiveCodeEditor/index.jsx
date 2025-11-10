import React, { useEffect, useRef, useState } from 'react';
import { Compartment, EditorState } from '@codemirror/state';
import {
  EditorView,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
} from '@codemirror/view';
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands';
import { 
  autocompletion, 
  completionKeymap,
  completeFromList,
  snippetCompletion,
} from '@codemirror/autocomplete';
import {
  bracketMatching,
  indentOnInput,
  syntaxHighlighting,
  defaultHighlightStyle,
} from '@codemirror/language';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { useColorMode } from '@docusaurus/theme-common';
import styles from './styles.module.css';

const baseEditorTheme = EditorView.baseTheme({
  '&.cm-editor': {
    fontFamily: 'var(--ifm-font-family-monospace, Menlo, Monaco, Consolas, "Courier New", monospace)',
    fontSize: '13px',
    borderRadius: '8px',
  },
  '.cm-content': {
    padding: '12px 0',
  },
  '.cm-gutters': {
    border: 'none',
  },
});

const lightTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: 'var(--ifm-background-surface-color)',
      color: 'var(--ifm-font-color-base)',
    },
    '.cm-gutters': {
      backgroundColor: 'var(--ifm-background-surface-color)',
      color: 'var(--ifm-color-emphasis-600)',
    },
    '&.cm-editor.cm-focused': {
      outline: '2px solid var(--ifm-color-primary)',
      outlineOffset: '-2px',
    },
  },
  { dark: false }
);

// 提取代码中定义的函数和变量
const extractLocalIdentifiers = (code) => {
  const identifiers = [];
  
  // 匹配函数声明: function name(...)
  const functionPattern = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
  let match;
  while ((match = functionPattern.exec(code)) !== null) {
    identifiers.push({
      label: match[1],
      type: 'function',
      info: '本地函数',
    });
  }
  
  // 匹配变量声明: const/let/var name
  const varPattern = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  while ((match = varPattern.exec(code)) !== null) {
    identifiers.push({
      label: match[1],
      type: 'variable',
      info: '本地变量',
    });
  }
  
  return identifiers;
};

// 常用的 JavaScript 内置对象和方法补全
const builtinCompletions = [
  // Console API
  { label: 'console', type: 'variable', info: '控制台对象' },
  { label: 'console.log', type: 'method', info: '输出日志' },
  { label: 'console.error', type: 'method', info: '输出错误' },
  { label: 'console.warn', type: 'method', info: '输出警告' },
  { label: 'console.table', type: 'method', info: '表格输出' },
  
  // Math 对象常用方法
  { label: 'Math', type: 'class', info: '数学对象' },
  { label: 'Math.floor', type: 'method', info: '向下取整' },
  { label: 'Math.ceil', type: 'method', info: '向上取整' },
  { label: 'Math.round', type: 'method', info: '四舍五入' },
  { label: 'Math.max', type: 'method', info: '最大值' },
  { label: 'Math.min', type: 'method', info: '最小值' },
  { label: 'Math.random', type: 'method', info: '随机数 [0,1)' },
  { label: 'Math.abs', type: 'method', info: '绝对值' },
  { label: 'Math.sqrt', type: 'method', info: '平方根' },
  { label: 'Math.pow', type: 'method', info: '幂运算' },
  
  // Array 常用方法
  { label: 'push', type: 'method', info: '末尾添加元素' },
  { label: 'pop', type: 'method', info: '删除末尾元素' },
  { label: 'shift', type: 'method', info: '删除首个元素' },
  { label: 'unshift', type: 'method', info: '开头添加元素' },
  { label: 'slice', type: 'method', info: '截取数组片段' },
  { label: 'splice', type: 'method', info: '删除/插入元素' },
  { label: 'map', type: 'method', info: '映射数组' },
  { label: 'filter', type: 'method', info: '过滤数组' },
  { label: 'reduce', type: 'method', info: '归约数组' },
  { label: 'forEach', type: 'method', info: '遍历数组' },
  { label: 'find', type: 'method', info: '查找元素' },
  { label: 'findIndex', type: 'method', info: '查找索引' },
  { label: 'indexOf', type: 'method', info: '获取索引' },
  { label: 'includes', type: 'method', info: '是否包含' },
  { label: 'join', type: 'method', info: '连接为字符串' },
  { label: 'sort', type: 'method', info: '排序数组' },
  { label: 'reverse', type: 'method', info: '反转数组' },
  { label: 'concat', type: 'method', info: '合并数组' },
  
  // String 常用方法
  { label: 'length', type: 'property', info: '长度' },
  { label: 'split', type: 'method', info: '分割字符串' },
  { label: 'substring', type: 'method', info: '截取子串' },
  { label: 'toLowerCase', type: 'method', info: '转小写' },
  { label: 'toUpperCase', type: 'method', info: '转大写' },
  { label: 'trim', type: 'method', info: '去除空格' },
  { label: 'replace', type: 'method', info: '替换字符串' },
  { label: 'charAt', type: 'method', info: '获取字符' },
  
  // JSON
  { label: 'JSON', type: 'class', info: 'JSON 对象' },
  { label: 'JSON.stringify', type: 'method', info: '对象转字符串' },
  { label: 'JSON.parse', type: 'method', info: '字符串转对象' },
  
  // 其他常用
  { label: 'Array', type: 'class', info: '数组构造函数' },
  { label: 'Object', type: 'class', info: '对象构造函数' },
  { label: 'String', type: 'class', info: '字符串构造函数' },
  { label: 'Number', type: 'class', info: '数字构造函数' },
];

// 自定义补全源 - 结合内置和本地标识符
const customCompletionSource = (context) => {
  const word = context.matchBefore(/[\w$.]+/);
  if (!word || (word.from === word.to && !context.explicit)) {
    return null;
  }
  
  const code = context.state.doc.toString();
  const localIds = extractLocalIdentifiers(code);
  
  // 合并本地标识符和内置补全
  const allCompletions = [...localIds, ...builtinCompletions];
  
  // 去重并过滤匹配项
  const seen = new Set();
  const wordText = word.text.toLowerCase();
  const uniqueCompletions = allCompletions
    .filter(item => {
      if (seen.has(item.label)) return false;
      seen.add(item.label);
      // 模糊匹配
      return item.label.toLowerCase().includes(wordText);
    })
    .sort((a, b) => {
      // 优先显示本地定义的标识符
      if (a.info === '本地函数' || a.info === '本地变量') return -1;
      if (b.info === '本地函数' || b.info === '本地变量') return 1;
      // 然后按字母顺序
      return a.label.localeCompare(b.label);
    });
  
  return {
    from: word.from,
    options: uniqueCompletions,
    validFor: /^[\w$.]*$/,
  };
};

const InteractiveCodeEditor = ({
  defaultCode = '',
  height = '400px',
  readOnly = false,
  showLineNumbers = true,
  theme = 'auto'
}) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [expressionInput, setExpressionInput] = useState('');
  const [expressionResult, setExpressionResult] = useState('');
  const [error, setError] = useState(null);
  const { colorMode } = useColorMode();

  const themeCompartment = useRef(new Compartment());
  const lineNumberCompartment = useRef(new Compartment());
  const readOnlyCompartment = useRef(new Compartment());
  const editableCompartment = useRef(new Compartment());

  // Determine theme based on prop or color mode
  const effectiveTheme = theme === 'auto' ? colorMode : theme;
  const isDark = effectiveTheme === 'dark';

  // Initialize CodeMirror editor
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!editorRef.current || viewRef.current) return;

    const startState = EditorState.create({
      doc: defaultCode,
      extensions: [
        highlightSpecialChars(),
        history(),
        drawSelection(),
        dropCursor(),
        indentOnInput(),
        bracketMatching(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        autocompletion({ 
          override: [customCompletionSource],
          activateOnTyping: true,
        }),
        javascript({ jsx: true, typescript: true }),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        baseEditorTheme,
        themeCompartment.current.of(isDark ? oneDark : lightTheme),
        lineNumberCompartment.current.of(showLineNumbers ? lineNumbers() : []),
        readOnlyCompartment.current.of(EditorState.readOnly.of(readOnly)),
        editableCompartment.current.of(EditorView.editable.of(!readOnly)),
        keymap.of([
          indentWithTab,
          ...defaultKeymap,
          ...historyKeymap,
          ...completionKeymap,
        ]),
      ],
    });

    viewRef.current = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!viewRef.current) return;
    const currentDoc = viewRef.current.state.doc.toString();
    if (defaultCode !== currentDoc) {
      viewRef.current.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: defaultCode },
      });
    }
  }, [defaultCode]);

  useEffect(() => {
    if (!viewRef.current) return;
    const extension = isDark ? oneDark : lightTheme;
    viewRef.current.dispatch({
      effects: themeCompartment.current.reconfigure(extension),
    });
  }, [isDark]);

  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: lineNumberCompartment.current.reconfigure(
        showLineNumbers ? lineNumbers() : []
      ),
    });
  }, [showLineNumbers]);

  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: readOnlyCompartment.current.reconfigure(
        EditorState.readOnly.of(readOnly)
      ),
    });
    viewRef.current.dispatch({
      effects: editableCompartment.current.reconfigure(
        EditorView.editable.of(!readOnly)
      ),
    });
  }, [readOnly]);

  const runCode = () => {
    if (!viewRef.current) return;

    const code = viewRef.current.state.doc.toString();
    setConsoleOutput([]);
    setError(null);
    setExpressionResult('');

    // Create a sandbox to capture console.log
    const logs = [];
    const customConsole = {
      log: (...args) => {
        logs.push(args.map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch (e) {
              return String(arg);
            }
          }
          return String(arg);
        }).join(' '));
      },
      error: (...args) => {
        logs.push('ERROR: ' + args.join(' '));
      },
      warn: (...args) => {
        logs.push('WARN: ' + args.join(' '));
      }
    };

    try {
      // Create a function with the user's code
      const func = new Function('console', code);
      func(customConsole);
      setConsoleOutput(logs);
    } catch (err) {
      setError(err.message);
      setConsoleOutput([`Error: ${err.message}`]);
    }
  };

  const evaluateExpression = () => {
    if (!expressionInput.trim() || !viewRef.current) return;

    const code = viewRef.current.state.doc.toString();
    setError(null);

    try {
      // Execute the code first to define functions
      const func = new Function(code + `\nreturn ${expressionInput};`);
      const result = func();
      
      // Format the result
      let formattedResult;
      if (typeof result === 'object') {
        try {
          formattedResult = JSON.stringify(result, null, 2);
        } catch (e) {
          formattedResult = String(result);
        }
      } else {
        formattedResult = String(result);
      }
      
      setExpressionResult(formattedResult);
    } catch (err) {
      setExpressionResult(`Error: ${err.message}`);
      setError(err.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      evaluateExpression();
    }
  };

  return (
    <div className={styles.container} data-theme={isDark ? 'dark' : 'light'}>
      <div className={styles.editorWrapper} style={{ height }}>
        <div ref={editorRef} className={styles.editor} />
      </div>
      
      <div className={styles.controls}>
        <button 
          onClick={runCode} 
          className={styles.runButton}
          disabled={readOnly}
        >
          ▶ 运行代码
        </button>
      </div>

      <div className={styles.outputSection}>
        <div className={styles.consoleOutput}>
          <div className={styles.outputLabel}>控制台输出：</div>
          <div className={styles.outputContent}>
            {consoleOutput.length === 0 && !error ? (
              <div className={styles.emptyOutput}>点击"运行代码"查看输出...</div>
            ) : (
              consoleOutput.map((log, index) => (
                <div key={index} className={styles.logLine}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.expressionEval}>
          <div className={styles.outputLabel}>输出：</div>
          {expressionResult ? (
            <div className={styles.expressionResult}>
              <pre>{expressionResult}</pre>
            </div>
          ) : (
            <div className={styles.expressionResult}>
              <div className={styles.emptyOutput}>
              </div>
            </div>
          )}
          <div className={styles.expressionInputWrapper}>
            <input
              type="text"
              value={expressionInput}
              onChange={(e) => setExpressionInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入表达式，如: bubbleSort([3,1,2])"
              className={styles.expressionInput}
            />
            <button 
              onClick={evaluateExpression}
              className={styles.evalButton}
              disabled={readOnly || !expressionInput.trim()}
            >
              执行
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveCodeEditor;
