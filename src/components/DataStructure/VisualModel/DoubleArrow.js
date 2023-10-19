import React from 'react';
import {RightOutlined, SwapOutlined} from '@ant-design/icons';

function DoubleArrow({ direction = 'right', color = 'black', size = 20 }) {
    const commonStyle = {
        color: color,
        fontSize: size,
        display: 'inline-block',
        width:'1000px'
    };

    if (direction === 'left') {
        return (
            <SwapOutlined style={{ ...commonStyle, transform: 'rotate(180deg)' }} />
        );
    } else if (direction === 'both') {
        return (
            <span>
                {/*<SwapOutlined style={{ ...commonStyle, transform: 'rotate(180deg)', marginRight: size * 0.2 }} />*/}
                <SwapOutlined width={"1000px"} style={commonStyle} />
            </span>
        );
    }

    return (
        <SwapOutlined style={commonStyle} />
    );
}

export default DoubleArrow;
