import React, { useRef, useState } from 'react';
import { Card, Tag } from 'antd';
import { spring, Motion } from 'react-motion';
import { DoublyLinkedList } from './DataModel/LinkedList';
import DoubleArrow from "./VisualModel/DoubleArrow";

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
                            <Card style={{ borderRadius: '50%', width: 50, height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid black' }}>
                                <Tag color="blue">{node}</Tag>
                            </Card>
                            {/*{index < nodes.length - 1 && (*/}
                            {/*    <DoubleArrow direction="right" color="blue" size={30} />*/}
                            {/*)}*/}
                        </div>
                    )}
                </Motion>
            ))}
        </div>
    );
}
