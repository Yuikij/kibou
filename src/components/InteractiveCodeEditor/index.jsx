import React, { useEffect, useRef, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { useColorMode } from '@docusaurus/theme-common';
import styles from './styles.module.css';

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

  // Determine theme based on prop or color mode
  const effectiveTheme = theme === 'auto' ? colorMode : theme;
  const isDark = effectiveTheme === 'dark';

  // Initialize CodeMirror editor
  useEffect(() => {
    if (!editorRef.current) return;

    // Clean up existing view if any
    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    const extensions = [
      javascript(),
      keymap.of(defaultKeymap),
    ];

    if (showLineNumbers) {
      extensions.push(lineNumbers());
    }

    if (isDark) {
      extensions.push(oneDark);
    }

    if (readOnly) {
      extensions.push(EditorState.readOnly.of(true));
    }

    const startState = EditorState.create({
      doc: defaultCode,
      extensions,
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [defaultCode, readOnly, showLineNumbers, isDark]);

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
          {expressionResult && (
            <div className={styles.expressionResult}>
              <pre>{expressionResult}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveCodeEditor;
