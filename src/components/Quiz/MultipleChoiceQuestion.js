import React, {useState} from 'react';
import {Button, Radio, Card, Alert, Image, Row, Col, Checkbox} from 'antd';
import {EyeOutlined, EyeInvisibleOutlined} from '@ant-design/icons';

function MultipleChoiceQuestion({question, options, correctAnswers, image, explanation, optionExplanations}) {
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [showImage, setShowImage] = useState(true);

    const handleOptionChange = e => {
        setSelectedOptions([e.target.value]);
        setSelectedOption(e.target.value);
    }

    const handleSelectOptionChange = checkedValues => {
        setSelectedOptions(checkedValues);
    }

    const handleSubmit = () => {
        // const answerIsCorrect = selectedOption === correctAnswer;
        const answerIsCorrect = selectedOptions.every(option => correctAnswers.includes(option)) && selectedOptions.length === correctAnswers.length;

        setIsCorrect(answerIsCorrect);
        setShowExplanation(false); // Hide the explanation after each submission
    }

    return (
        <Card style={{marginBottom: '30px',marginTop:"10px"}}>
            {
                question&&<p style={{fontWeight: 'bold', marginBottom: '20px'}}>{question}</p>
            }

            <Row gutter={16}>
                <Col span={showImage && image ? 14 : 24}>
                    {correctAnswers.length > 1 ?
                        <Checkbox.Group style={{width: '100%', display: "flex", flexFlow: "column"}}
                                        onChange={handleSelectOptionChange}
                                        value={selectedOptions}>
                            {options.map((option, index) => (
                                <div key={index} style={{marginBottom: '30px'}}>
                                    <Checkbox value={option}>
                                        {/*<div style={{display: "flex", alignItems: "center"}}>*/}
                                        <Row>
                                            <span> {option}</span>
                                            {showExplanation && optionExplanations && optionExplanations[index] &&
                                                <span style={{
                                                    display: 'block',
                                                    fontStyle: 'italic',
                                                    marginLeft: '25px'
                                                }}>---{optionExplanations[index]}</span>
                                            }
                                        </Row>
                                        {/*</div>*/}
                                    </Checkbox>
                                </div>
                            ))}
                        </Checkbox.Group> :
                        <Radio.Group onChange={handleOptionChange} value={selectedOption}>
                            {options.map((option, index) => (
                                <div key={index} style={{marginBottom: '30px'}}>
                                    <Radio value={option}>
                                        <div style={{display: "flex", alignItems: "center"}}>
                                            <span> {option}</span>
                                            {showExplanation && optionExplanations && optionExplanations[index] &&
                                                <span style={{
                                                    display: 'block',
                                                    fontStyle: 'italic',
                                                    marginLeft: '25px'
                                                }}>---{optionExplanations[index]}</span>
                                            }
                                        </div>
                                    </Radio>
                                </div>
                            ))}
                        </Radio.Group>
                    }
                </Col>
                {showImage && image && (
                    <Col span={10}>
                        <Image src={image} width="50%" alt="Quiz"/>
                    </Col>
                )}
            </Row>
            <div>
                <Button type="primary" onClick={handleSubmit} style={{marginRight: '15px'}}>
                    提交
                </Button>
                {explanation &&
                    <Button style={{marginRight: '15px',width:"150px"}} onClick={() => setShowExplanation(!showExplanation)}>
                        {showExplanation ? "隐藏解析" : "展开解析"}
                    </Button>
                }
                {
                    image && <Button
                        icon={showImage ? <EyeInvisibleOutlined/> : <EyeOutlined/>}
                        onClick={() => setShowImage(!showImage)}
                    >
                        {showImage ? "隐藏图片" : "展开图片"}
                    </Button>
                }
            </div>
            {isCorrect !== null && (
                <div style={{marginTop: '20px'}}>
                    <Alert
                        message={isCorrect ? "Correct!" : "Incorrect."}
                        description={showExplanation && explanation}
                        type={isCorrect ? "success" : "error"}
                    />
                </div>
            )}
        </Card>
    );
}

export default MultipleChoiceQuestion;
