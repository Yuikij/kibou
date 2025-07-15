import React, { useState, useEffect } from 'react';
import styles from './JapaneseText2.module.css';

// 传递参数：文本、翻译、注释和笔记
// notes 数据结构优化为：
// {
//   0: { "単語": "这是第一句中的笔记" },  // 句子索引0
//   1: { "単語": "这是第二句中的笔记" },  // 句子索引1
//   2: { "文字": "另一个笔记" }         // 句子索引2
// }
// 或者使用更详细的结构：
// [
//   [{ text: "単語", note: "笔记内容", startIndex: 5 }],  // 第0句的笔记数组
//   [{ text: "文字", note: "笔记内容", startIndex: 10 }], // 第1句的笔记数组
//   []  // 第2句没有笔记
// ]
function JapaneseText2({ texts, translations, annotations, fullText, notes }) {
    const [parsedTexts, setParsedTexts] = useState([]);
    const [parsedTranslations, setParsedTranslations] = useState([]);
    const [parsedAnnotations, setParsedAnnotations] = useState([]);
    const [parsedNotes, setParsedNotes] = useState({});
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [activeWordIndex, setActiveWordIndex] = useState(null);
    const [showFurigana, setShowFurigana] = useState(true);
    const [showTranslation, setShowTranslation] = useState(true);
    const [showNotes, setShowNotes] = useState(true);
    const [showLineNumbers, setShowLineNumbers] = useState(false);
    const [activeNote, setActiveNote] = useState(null);
    const [notePosition, setNotePosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (fullText) {
            const newTexts = [];
            const newTranslations = [];
            const newAnnotations = [];
            
            fullText.forEach((item) => {
                newTexts.push(item[0]);
                newAnnotations.push(item[1]);
                newTranslations.push(item[2]);
            });
            
            setParsedTexts(newTexts);
            setParsedTranslations(newTranslations);
            setParsedAnnotations(newAnnotations);
        } else {
            setParsedTexts(texts || []);
            setParsedTranslations(translations || []);
            setParsedAnnotations(annotations || []);
        }
        
        // 解析笔记数据 - 支持两种数据结构
        if (notes) {
            if (Array.isArray(notes)) {
                // 数组格式: [sentence0Notes, sentence1Notes, ...]
                // 其中每个sentenceNotes是: [{ text: "单词", note: "笔记", startIndex?: number }]
                const notesObj = {};
                notes.forEach((sentenceNotes, index) => {
                    if (sentenceNotes && sentenceNotes.length > 0) {
                        notesObj[index] = {};
                        sentenceNotes.forEach(noteItem => {
                            if (noteItem.startIndex !== undefined) {
                                // 使用 startIndex 创建唯一key
                                notesObj[index][`${noteItem.text}_${noteItem.startIndex}`] = noteItem.note;
                            } else {
                                // 兼容简单格式
                                notesObj[index][noteItem.text] = noteItem.note;
                            }
                        });
                    }
                });
                setParsedNotes(notesObj);
            } else {
                // 对象格式: { 0: { "単語": "笔记" }, 1: { "単語": "另一个笔记" } }
                setParsedNotes(notes);
            }
        } else {
            setParsedNotes({});
        }
    }, [texts, translations, annotations, fullText, notes]);

    // 处理笔记点击
    const handleNoteClick = (noteKey, noteContent, event) => {
        if (!noteContent || !showNotes) return;
        
        const rect = event.target.getBoundingClientRect();
        setNotePosition({
            top: rect.top + window.scrollY,
            left: rect.right + 10
        });
        
        // 提取显示文本（去掉startIndex后缀）
        const displayText = noteKey.includes('_') ? noteKey.split('_')[0] : noteKey;
        setActiveNote({ text: displayText, content: noteContent });
    };

    // 关闭笔记
    const closeNote = () => {
        setActiveNote(null);
    };

    // 渲染带注释的文本
    const renderTextWithAnnotations = (text, annotation, sentenceIndex) => {
        if (!annotation || Object.keys(annotation).length === 0) {
            // 检查是否有笔记需要高亮
            return (
                <div className={styles.textContent}>
                    {renderTextWithNotes(text, sentenceIndex, 0)}
                </div>
            );
        }

        let result = [];
        let currentIndex = 0;
        let wordIndex = 0;

        // 遍历每个词汇和其注释
        Object.keys(annotation).forEach((word) => {
            // 查找词汇在文本中的位置
            let index = text.indexOf(word, currentIndex);
            if (index !== -1) {
                // 将词汇之前的部分加入结果
                if (index > currentIndex) {
                    const beforeText = text.substring(currentIndex, index);
                    result.push(
                        <span key={`plain-${index}`} className={styles.plainText}>
                            {renderTextWithNotes(beforeText, sentenceIndex, currentIndex)}
                        </span>
                    );
                }

                // 添加带注释的词汇
                const currentWordIndex = `${sentenceIndex}-${wordIndex}`;
                result.push(
                    <div 
                        key={`annotated-${index}`} 
                        className={styles.annotatedWord}
                        onMouseEnter={() => setActiveWordIndex(currentWordIndex)}
                        onMouseLeave={() => setActiveWordIndex(null)}
                    >
                        <ruby className={styles.ruby}>
                            <span className={styles.kanjiText}>{word}</span>
                            {showFurigana && (
                                <rt className={`${styles.rubyText} ${activeWordIndex === currentWordIndex ? styles.rubyTextActive : ''}`}>
                                    {annotation[word]}
                                </rt>
                            )}
                        </ruby>
                    </div>
                );

                // 更新当前索引
                currentIndex = index + word.length;
                wordIndex++;
            }
        });

        // 将文本剩余部分加入结果
        if (currentIndex < text.length) {
            const remainingText = text.substring(currentIndex);
            result.push(
                <span key={`plain-end`} className={styles.plainText}>
                    {renderTextWithNotes(remainingText, sentenceIndex, currentIndex)}
                </span>
            );
        }

        return <div className={styles.textContent}>{result}</div>;
    };

    // 渲染带笔记的文本
    const renderTextWithNotes = (text, sentenceIndex, offsetIndex = 0) => {
        const sentenceNotes = parsedNotes[sentenceIndex];
        if (!sentenceNotes || Object.keys(sentenceNotes).length === 0) {
            return <span className={styles.plainText}>{text}</span>;
        }

        let result = [];
        let currentIndex = 0;
        let processedPositions = new Set(); // 避免重复处理相同位置

        // 按文本长度排序笔记关键词，优先匹配长的词汇
        const sortedNoteKeys = Object.keys(sentenceNotes).sort((a, b) => {
            const aText = a.includes('_') ? a.split('_')[0] : a;
            const bText = b.includes('_') ? b.split('_')[0] : b;
            return bText.length - aText.length;
        });

        sortedNoteKeys.forEach((noteKey) => {
            const noteContent = sentenceNotes[noteKey];
            let noteText = noteKey;
            let targetIndex = -1;

            if (noteKey.includes('_')) {
                // 包含startIndex的格式 "text_startIndex"
                const [text, startIndexStr] = noteKey.split('_');
                const startIndex = parseInt(startIndexStr);
                noteText = text;
                
                // 计算在当前文本片段中的相对位置
                const relativeIndex = startIndex - offsetIndex;
                if (relativeIndex >= 0 && relativeIndex < text.length) {
                    targetIndex = relativeIndex;
                }
            } else {
                // 简单格式，查找第一个匹配
                targetIndex = text.indexOf(noteText, currentIndex);
            }

            if (targetIndex !== -1 && targetIndex >= currentIndex && !processedPositions.has(targetIndex)) {
                // 将关键词之前的部分加入结果
                if (targetIndex > currentIndex) {
                    result.push(
                        <span key={`text-${targetIndex}`} className={styles.plainText}>
                            {text.substring(currentIndex, targetIndex)}
                        </span>
                    );
                }

                // 添加带笔记的关键词
                result.push(
                    <span
                        key={`note-${targetIndex}`}
                        className={styles.noteHighlight}
                        onClick={(e) => handleNoteClick(noteKey, noteContent, e)}
                    >
                        {noteText}
                    </span>
                );

                // 标记处理过的位置和更新当前索引
                processedPositions.add(targetIndex);
                currentIndex = targetIndex + noteText.length;
            }
        });

        // 将文本剩余部分加入结果
        if (currentIndex < text.length) {
            result.push(
                <span key={`text-end`} className={styles.plainText}>
                    {text.substring(currentIndex)}
                </span>
            );
        }

        return result.length > 0 ? result : <span className={styles.plainText}>{text}</span>;
    };

    // 渲染每行内容
    const renderContent = () => {
        return parsedTexts.map((text, index) => {
            const translation = parsedTranslations[index] || "";
            const annotation = parsedAnnotations[index] || {};

            return (
                <div 
                    key={index} 
                    className={`${styles.textBlock} ${hoveredIndex === index ? styles.textBlockHovered : ''}`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <div className={styles.lineContainer}>
                        <div className={styles.lineNumberArea}>
                            {showLineNumbers && (
                                <div className={styles.lineNumber}>
                                    {String(index + 1).padStart(2, '0')}
                                </div>
                            )}
                        </div>
                        <div className={styles.lineContent}>
                            <div className={styles.japaneseSection}>
                                {renderTextWithAnnotations(text, annotation, index)}
                            </div>
                            {translation && showTranslation && (
                                <div className={styles.translationSection}>
                                    <div className={styles.translationText}>
                                        {translation}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <div className={styles.toggleGroup}>
                    <div className={styles.toggleContainer}>
                        <label className={styles.toggleLabel}>
                            <input
                                type="checkbox"
                                checked={showFurigana}
                                onChange={(e) => setShowFurigana(e.target.checked)}
                                className={styles.toggleInput}
                            />
                            <span className={styles.toggleSlider}></span>
                            <span className={styles.toggleText}>显示注音</span>
                        </label>
                    </div>
                    <div className={styles.toggleContainer}>
                        <label className={styles.toggleLabel}>
                            <input
                                type="checkbox"
                                checked={showTranslation}
                                onChange={(e) => setShowTranslation(e.target.checked)}
                                className={styles.toggleInput}
                            />
                            <span className={styles.toggleSlider}></span>
                            <span className={styles.toggleText}>显示翻译</span>
                        </label>
                    </div>
                    <div className={styles.toggleContainer}>
                        <label className={styles.toggleLabel}>
                            <input
                                type="checkbox"
                                checked={showNotes}
                                onChange={(e) => setShowNotes(e.target.checked)}
                                className={styles.toggleInput}
                            />
                            <span className={styles.toggleSlider}></span>
                            <span className={styles.toggleText}>显示笔记</span>
                        </label>
                    </div>
                    <div className={styles.toggleContainer}>
                        <label className={styles.toggleLabel}>
                            <input
                                type="checkbox"
                                checked={showLineNumbers}
                                onChange={(e) => setShowLineNumbers(e.target.checked)}
                                className={styles.toggleInput}
                            />
                            <span className={styles.toggleSlider}></span>
                            <span className={styles.toggleText}>显示行号</span>
                        </label>
                    </div>
                </div>
            </div>
            <div className={styles.content}>
                {renderContent()}
            </div>
            
            {/* 笔记面板 */}
            {activeNote && showNotes && (
                <div className={styles.notePanel} style={{ top: notePosition.top, left: notePosition.left }}>
                    <div className={styles.noteHeader}>
                        <span className={styles.noteTitle}>{activeNote.text}</span>
                        <button className={styles.noteCloseButton} onClick={closeNote}>
                            ×
                        </button>
                    </div>
                    <div className={styles.noteContent}>
                        {activeNote.content}
                    </div>
                </div>
            )}
            
            {/* 点击遮罩关闭笔记 */}
            {activeNote && showNotes && (
                <div className={styles.noteOverlay} onClick={closeNote}></div>
            )}
        </div>
    );
}

export default JapaneseText2;
