import React, { useRef } from 'react';
import {Button, Radio, Card, Alert, Image, Row, Col} from 'antd';
import ArrayComponent from './Array.js';

function ArrayOpt() {
    const arrayRef = useRef(null);

    const handleAdd = () => {
        arrayRef.current.add(Math.floor(Math.random() * 100));  // For demonstration, we're adding random numbers
    };

    const handleRemove = () => {
        const length = arrayRef.current.length;
        const randomIndex = Math.floor(Math.random() * length);  // Removing random item for demonstration
        arrayRef.current.remove(randomIndex);
    };

    return (
        <div>
            <Button onClick={handleAdd}>Add Item</Button>
            <Button onClick={handleRemove}>Remove Random Item</Button>
            <ArrayComponent arrayRef={arrayRef} />
        </div>
    );
}

export default ArrayOpt;
