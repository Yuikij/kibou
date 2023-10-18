import React, { useState } from 'react';
import { Motion, spring } from 'react-motion';

export default function  SwapArray() {
    const [items, setItems] = useState([
        { key: 'A', data: 'Item A' },
        { key: 'B', data: 'Item B' }
    ]);

    const swap = () => {
        setItems((prevItems) => [prevItems[1], prevItems[0]]);
    };

    return (
        <div>
            <button onClick={swap}>Swap Items</button>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                {items.map((item, index) => (
                    <Motion
                        key={item.key}
                        defaultStyle={{ x: index * 100 }}
                        style={{ x: spring(index * 100) }}
                    >
                        {(style) => (
                            <div
                                style={{
                                    transform: `translateX(${style.x}px)`,
                                    padding: '10px',
                                    margin: '0 10px',
                                    border: '1px solid black'
                                }}
                            >
                                {item.data}
                            </div>
                        )}
                    </Motion>
                ))}
            </div>
        </div>
    );
}
