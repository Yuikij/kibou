import React, {useState} from 'react';
import {spring, Motion} from 'react-motion';
import NodeViewer from "./VisualModel/NodeViewer";
import {Card} from "antd";
import {centerStyle} from "../Css";

export default function ArrayComponent(props) {
    const [items, setItems] = useState(props.initialItems || []);

    function blinkElement(element) {
        // 添加闪烁类
        element.classList.add('blinking');

        // 在动画结束后移除闪烁类
        element.addEventListener('animationend', function () {
            element.classList.remove('blinking');
        }, {once: true}); // 这确保事件监听器只会被调用一次
    }


    const add = (item) => {
        setItems([...items, item]);
    };

    const addIndex = (item, index) => {
        console.log(`item`,item)
        console.log(`index`,index)
        const newItems = [...items];
        const itemEle = document.getElementById("arrayItem" + index);
        blinkElement(itemEle);
        newItems[index] = item;
        console.log(`newItems`,newItems)
        setItems([...newItems]);
    };
    const remove = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const getArr = () => {
        return items;
    }

    const getLength = () => {
        return items.length
    }

    const init = (arr) => {
        setItems(arr);
    }

    // Exposing the methods to parent using ref
    React.useImperativeHandle(props.arrayRef, () => ({
        add,
        remove,
        getLength,
        init,
        addIndex,
        getArr
    }));

    const gridStyle = {
        width: "60px",
        height: "60px",
        textAlign: 'center',
        ...centerStyle
    };


    return (
        <Card className="scroll-box" style={{
            borderColor: "black", height: "70px",
            ...centerStyle, overflowX: "inherit", overflowY: "hidden", margin: "20px 0"
        }}
              bodyStyle={{padding: 0, display: "flex", flexDirection: "row", width: "100%"}}>
            {items.map((item, index) => (
                <Motion key={index} defaultStyle={{x: 0}} style={{x: spring(1)}}>
                    {value =>
                        <Card.Grid id={"arrayItem" + index}
                                   style={{...gridStyle, transform: `scale(${value.x})`}}>{item}</Card.Grid>
                    }
                </Motion>
            ))}
        </Card>
    )

    // return (
    //     <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
    //         {items.map((item, index) => (
    //             <Motion key={index} defaultStyle={{ x: 0 }} style={{ x: spring(1) }}>
    //                 {value =>
    //                     <NodeViewer value={item} transform={ `scale(${value.x})`}/>
    //                 }
    //             </Motion>
    //         ))}
    //     </div>
    // );
}
