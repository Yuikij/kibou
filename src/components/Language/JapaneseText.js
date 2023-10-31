import React from 'react';
import {columnCenterStyle} from "../Css";


function JapaneseText({text, annotations}) {
    const renderAnnotatedText = (text, annotations) => {
        const parts = text.split(/(\${.*?:.*?})/);
        return parts.map((part, index) => {
            let annotation = "fix";
            if (part.startsWith("${") && part.endsWith("}")) {
                const key = part.slice(2, -1);
                let [word, annotationKey] = key.split(":");
                annotation = annotations[annotationKey];
                part = word;
            }
            // if (annotation === "fix") {
            //    return  (part.split(" ").map((partWord, index) =>
            //         (<div style={{display: "inline-block"}}>
            //             <div style={columnCenterStyle}>
            //                 {<div className="annotation" style={annotation === "fix" ? {visibility: "hidden"} : {}}>
            //                     {annotation}
            //                 </div>}
            //                 <span key={index} className="annotated-word">
            //                      {partWord}
            //             </span>
            //             </div>
            //         </div>)
            //     ))
            // }

            return (<div style={{display: "inline-block"}}>
                    <div style={columnCenterStyle}>
                        {<div className="annotation" style={annotation === "fix" ? {visibility: "hidden"} : {}}>
                            {annotation}
                        </div>}
                        <span key={index} className="annotated-word">
                                 {part}
                        </span>
                    </div>
                </div>
            );
        });
    };

    return (<div>
        {renderAnnotatedText(text, annotations)}
    </div>);
}

export default JapaneseText;
