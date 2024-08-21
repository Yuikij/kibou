import React from 'react';

// 传递三个数组：文本、翻译和注释
function JapaneseText2({ texts, translations, annotations }) {

    // 渲染带注释的文本
    const renderTextWithAnnotations = (text, annotation) => {
        let result = [];
        let currentIndex = 0;

        // 遍历每个词汇和其注释
        Object.keys(annotation).forEach((word) => {
            // 查找词汇在文本中的位置
            let index = text.indexOf(word, currentIndex);
            if (index !== -1) {
                // 将词汇之前的部分加入结果
                if (index > currentIndex) {
                    result.push(
                        <span key={index}  style={{ whiteSpace: 'pre-line' }}>
                            {text.substring(currentIndex, index)}
                        </span>
                    );
                }

                // 添加带注释的词汇
                result.push(
                    <div className={"annotated-word"}>
                        <ruby key={index}>
                            {word}
                            <rt>{annotation[word]}</rt>
                        </ruby>
                    </div>
                );

                // 更新当前索引
                currentIndex = index + word.length;
            }
        });

        // 将文本剩余部分加入结果
        if (currentIndex < text.length) {
            result.push(text.substring(currentIndex));
        }

        return <div className={"translation-word"} >{result}</div>;
    };

    // 渲染每行内容
    const renderContent = () => {
        return texts.map((text, index) => {
            const translation = translations[index] || "";
            const annotation = annotations[index] || {};

            return (
                <div key={index} className="annotated-word">
                    {translation && (
                        <div className={"annotated-word"} style={{display: "block"}}>
                            {translation}
                        </div>
                    )}
                        {renderTextWithAnnotations(text, annotation)}
                    
                </div>
            );
        });
    };

    return <div>{renderContent()}</div>;
}

export default JapaneseText2;
