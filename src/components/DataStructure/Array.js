import React, {useState} from 'react';
import {spring, Motion} from 'react-motion';
import NodeViewer from "./VisualModel/NodeViewer";
import {Card} from "antd";

export default function ArrayComponent(props) {
    const [items, setItems] = useState(props.initialItems || []);

    const add = (item) => {
        setItems([...items, item]);
    };

    const remove = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    // Exposing the methods to parent using ref
    React.useImperativeHandle(props.arrayRef, () => ({
        add,
        remove,
    }));
    const gridStyle = {
        width: "60px",
        height: "60px",
        textAlign: 'center',
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    };


    return (
        <Card bodyStyle={{padding: 0, display: "flex", flexDirection: "row", width: "100%",borderColor:"black"}}>
            {items.map((item, index) => (
                <Motion key={index} defaultStyle={{x: 0}} style={{x: spring(1)}}>
                    {value =>
                        <Card.Grid style={{...gridStyle, transform: `scale(${value.x})`}}>{item}</Card.Grid>
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
