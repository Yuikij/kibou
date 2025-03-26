import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { Button, Modal, message } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';

// 在原有样式的基础上修改以下部分
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(235, 47, 150, 0.15);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(235, 47, 150, 0.18);
`;

const GameBoard = styled.canvas`
  border: 2px solid #eb2f96;
  border-radius: 12px;
  background: #fff;
  margin: 20px 0;
  box-shadow: 0 0 20px rgba(235, 47, 150, 0.1);
`;

const ScoreBoard = styled.div`
  font-size: 24px;
  color: #eb2f96;
  margin-bottom: 20px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
`;



const ControlPanel = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

const SnakeGame = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [snake, setSnake] = useState([
    { x: 10, y: 10 },
  ]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState('RIGHT');
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [close, setClose] = useState(false);

  // 生成食物
  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    setFood(newFood);
  }, []);

  // 游戏主循环
  useEffect(() => {
    if (gameOver || isPaused) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };

        switch (direction) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
          default: break;
        }

        // 检查碰撞
        if (
          head.x < 0 || head.x >= GRID_SIZE ||
          head.y < 0 || head.y >= GRID_SIZE ||
          newSnake.some(segment => segment.x === head.x && segment.y === head.y)
        ) {
          setGameOver(true);
          return prevSnake;
        }

        newSnake.unshift(head);

        // 检查是否吃到食物
        if (head.x === food.x && head.y === food.y) {
          setScore(prev => prev + 10);
          generateFood();
          setSpeed(prev => Math.max(prev * 0.95, 50));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const gameLoop = setInterval(moveSnake, speed);
    return () => clearInterval(gameLoop);
  }, [direction, food, gameOver, isPaused, generateFood, speed]);

  // 键盘控制
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver) return;
      // 阻止方向键的默认滚动行为
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        case ' ':
          setIsPaused(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameOver]);

  // 绘制游戏画面
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制蛇
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#eb2f96' : '#f5a3c7';
      ctx.shadowBlur = index === 0 ? 10 : 5;
      ctx.shadowColor = '#eb2f96';
      ctx.fillRect(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
      ctx.shadowBlur = 0;
    });

    // 绘制食物
    ctx.fillStyle = '#722ed1';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#722ed1';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [snake, food]);

  // 重置游戏
  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection('RIGHT');
    setScore(0);
    setSpeed(INITIAL_SPEED);
    generateFood();
    setGameOver(false);
    setIsPaused(false);
    setClose(false)
  };

    // 处理游戏结束
    const handleGameOver = () => {
        setGameOver(false);
        setClose(true);
        // 更新最高分
        if (score > highScore) {
          setHighScore(score);
        }
      };

  return (
    <GameContainer>
      <ScoreBoard>
        分数: {score} <TrophyOutlined style={{ color: '#faad14' }} /> 最高分: {highScore}
      </ScoreBoard>
      <GameBoard
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
      />
      <ControlPanel>
        <Button type="primary" onClick={() => setIsPaused(!isPaused)}>
          {isPaused ? '继续' : '暂停'}
        </Button>
        <Button onClick={resetGame}>重新开始</Button>
      </ControlPanel>
      <Modal
        title="游戏结束"
        open={gameOver&&!close}
        onOk={resetGame}
        onCancel={handleGameOver}
        okText="重新开始"
        cancelText="关闭"
      >
        <p>游戏结束！你的得分是：{score}</p>
        {score > highScore && (
          <p>恭喜你创造了新的最高分！</p>
        )}
      </Modal>
    </GameContainer>
  );
};

export default SnakeGame;