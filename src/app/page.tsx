"use client";
import React from 'react';
import styled from 'styled-components';

const Background = styled.div`
  width: 100vw;
  height: 100vh;
  background: url('/background.png') center center / cover no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContentWrapper = styled.div`
  color: white;
  text-align: center;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
`;

export default function Home() {
  return (
    <Background>
      <ContentWrapper>
        <Title>Badasspoet</Title>
        <Subtitle>Coming soon...</Subtitle>
      </ContentWrapper>
    </Background>
  );
}
