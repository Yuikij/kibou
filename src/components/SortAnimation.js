import React, { useState } from 'react';
import { Motion, spring } from 'react-motion';

function SortAnimation() {
    const [numbers, setNumbers] = useState([4, 1, 3, 2]);

    function sortNumbers() {
        const sortedNumbers = [...numbers].sort((a, b) => a - b);
        setNumbers(sortedNumbers);
    }

    return (
        <div>
            <button onClick={sortNumbers}>Sort</button>
            <div style={{ display: 'flex' }}>
                {numbers.map((num, index) => (
                    <Motion key={index} defaultStyle={{ x: index * 50 }} style={{ x: spring(numbers.indexOf(num) * 50) }}>
                        {style => (
                            <div
                                style={{
                                    transform: `translateX(${style.x}px)`,
                                    width: 40,
                                    height: 40,
                                    lineHeight: '40px',
                                    textAlign: 'center',
                                    background: 'lightblue',
                                    margin: 5,
                                }}
                            >
                                {num}
                            </div>
                        )}
                    </Motion>
                ))}
            </div>
        </div>
    );
}

export default SortAnimation;
