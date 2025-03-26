import React from 'react';
import Layout from '@theme/Layout';
import SnakeGame from '@site/src/components/SnakeGame';
import styled from 'styled-components';
import { HeartFilled } from '@ant-design/icons';

const PageContainer = styled.div`
  background: linear-gradient(135deg, #fff0f6 0%, #fff 100%);
  min-height: 90vh;
  padding: 2rem;
`;

const GameWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`;

const Title = styled.h1`
  color: #eb2f96;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  font-family: 'Segoe UI', sans-serif;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const Subtitle = styled.p`
  color: #722ed1;
  font-size: 1.2rem;
  margin-bottom: 2rem;
  font-style: italic;
`;

const HeartDecoration = styled.div`
  position: absolute;
  color: #eb2f96;
  opacity: 0.6;
  animation: float 3s ease-in-out infinite;
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0px); }
  }
`;

const hearts = Array(6).fill(null);

export default function SnakeGamePage() {
  return (
    <Layout
      title="小米的专属游戏"
      description="为最可爱的小米准备的特别游戏"
    >
      <PageContainer>
        {hearts.map((_, index) => (
          <HeartDecoration
            key={index}
            style={{
              top: `${Math.random() * 80}%`,
              left: `${Math.random() * 90}%`,
              fontSize: `${20 + Math.random() * 20}px`,
            }}
          >
            <HeartFilled />
          </HeartDecoration>
        ))}
        <GameWrapper>
          <Title>
            小米的专属游戏 
            <HeartFilled style={{ marginLeft: '10px', color: '#eb2f96' }} />
          </Title>
          <Subtitle>
            亲爱的小米，希望你玩得开心~ 
            这是专门为你定制的可爱贪吃蛇
          </Subtitle>
          <SnakeGame />
        </GameWrapper>
      </PageContainer>
    </Layout>
  );
}