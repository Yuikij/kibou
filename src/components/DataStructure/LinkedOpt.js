import React, { useRef } from 'react';
import Linked from "./Linked.js";
import {Button, Radio, Card, Alert, Image, Row, Col} from 'antd';
function LinkedOpt() {
    const linkedRef = useRef(null);

    const handleAddNode = () => {
        const randomValue = Math.floor(Math.random() * 100);
        linkedRef.current.addNode(randomValue);
    };

    const handleDeleteNode = () => {
        const randomValue = Math.floor(Math.random() * 100);  // For simplicity, we're using a random number to delete
        linkedRef.current.deleteNode(randomValue);
    };

    return (
        <div>
            <Button onClick={handleAddNode}>Add Node</Button>
            <Button onClick={handleDeleteNode}>Delete Random Node</Button>
            <Linked linkedRef={linkedRef} />
        </div>
    );
}

export default LinkedOpt;
