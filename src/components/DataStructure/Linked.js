import React, { useRef, useState } from 'react';
import { Card, Tag } from 'antd';
import { spring, Motion } from 'react-motion';
import { DoublyLinkedList } from './DataModel/LinkedList';
import DoubleArrow from "./VisualModel/DoubleArrow";
import NodeViewer from "./VisualModel/NodeViewer";

export default function Linked(props) {
    const [list] = useState(new DoublyLinkedList());
    const [nodes, setNodes] = useState([]);

    const addNode = (value) => {
        list.append(value);
        setNodes(list.toArray());
    };

    const deleteNode = (value) => {
        list.delete(value);
        setNodes(list.toArray());
    };

    React.useImperativeHandle(props.linkedRef, () => ({
        addNode,
        deleteNode,
    }));

    return (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            {nodes.map((node, index) => (
                <Motion key={index} defaultStyle={{ x: 0 }} style={{ x: spring(1) }}>
                    {value => (
                        <div style={{ display: 'flex', alignItems: 'center', transform: `scale(${value.x})` }}>
                            {index !== 0 && (
                                <DoubleArrow direction="both" />
                            )}
                            <NodeViewer value={node}/>
                        </div>
                    )}
                </Motion>
            ))}
        </div>
    );
}
