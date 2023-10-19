import React, { useState } from 'react';
import { spring, Motion } from 'react-motion';

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

    return (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            {items.map((item, index) => (
                <Motion key={index} defaultStyle={{ x: 0 }} style={{ x: spring(1) }}>
                    {value =>
                        <div style={{ transform: `scale(${value.x})`, margin: '5px', padding: '10px', border: '1px solid black', borderRadius: '4px' }}>
                            {item}
                        </div>
                    }
                </Motion>
            ))}
        </div>
    );
}
