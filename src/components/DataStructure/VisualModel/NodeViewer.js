import React from 'react';
import {Card} from "antd";

function NodeViewer({value = "node", transform}) {

    const style = {
        width: 50,
        height: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid black',
        margin:'0 6px'

    }

    if (transform) {
        style.transform = transform;
    }

    return <Card style={style}>
        {value}
    </Card>
}

export default NodeViewer;