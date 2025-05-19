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

export default function Home() {
  return (
    <Background />
  );
}
