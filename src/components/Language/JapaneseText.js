import React, {useEffect} from 'react';
import {columnCenterStyle} from "../Css";


function JapaneseText({text, annotations, translations}) {

    const renderTranslationsText = (text, translations) => {
        const parts = text.split(/(\$trans{.*?:\[.*?]}trans)/s);
        return parts.map((part, index) => {
            let translation = "fix";
            if (part.startsWith("$trans{") && part.endsWith("]}trans")) {
                const key = part.slice(7, -7);
                let [word, translationKey] = key.split(":[");
                translation = translations[translationKey];
                part = word;
            }
            return (<div className={"annotated-word"} key={index}>
                    {translation === "fix" ? <dev key={index}>
                            {renderAnnotatedText(part, annotations)}
                        </dev> :
                        <div>
                            <div className={"translation-word"} style={{display: "block"}}>
                                {translation}
                            </div>
                            {renderAnnotatedText(part, annotations)}
                        </div>
                    }
                </div>
            );
        });
    }

    const renderAnnotatedText = (text, annotations) => {
        const parts = text.split(/(\$anno{.*?:.*?})/);
        return parts.map((part, index) => {
            let annotation = "fix";
            if (part.startsWith("$anno{") && part.endsWith("}")) {
                const key = part.slice(6, -1);
                let [word, annotationKey] = key.split(":");
                annotation = annotations[annotationKey];
                part = word;
            }

            return (<div className={"annotated-word"} key={index}>
                    {annotation === "fix" ? <span key={index}>
                                 {part}
                        </span> :
                        <ruby>
                            {part}
                            <rt>
                                {/*<div style={{position:"absolute"}}>*/}
                                {annotation}
                                {/*</div>*/}
                            </rt>
                        </ruby>
                    }
                </div>
            );
        });
    };
    return (<div>
        {renderTranslationsText(text, translations)}
    </div>);
}

export default JapaneseText;
