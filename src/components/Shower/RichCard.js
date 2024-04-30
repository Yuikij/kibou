import React from 'react';
import { Card, Col, Row } from 'antd';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


/*
* {
* "线程共享":{"栈":"123","":""},
* "线程私有":{"堆":"123"},
* }
*
* */

function RichCard({params}) {
    const entries = Object.entries(params);
    return(
        <Tabs
            defaultValue={entries[0][0]}
            values={
                entries.map(([key]) => ({label: key, value: key}))
          }>
            {
                entries.map(([key,value]) => {
                    const cardEntries = Object.entries(value);
                    return <TabItem value={key}>
                        <Row gutter={16}>
                        {cardEntries.map(([cardKey,cardValue])=>
                            <Col span={8}>
                                <Card title={cardKey} bordered={false}>
                                    {cardValue}</Card>
                            </Col>
                       )}
                        </Row>
                    </TabItem>
                })
            }
        </Tabs>
        )
}

export default RichCard;
