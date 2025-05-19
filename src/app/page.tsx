"use client";
import React from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';

// Use dynamic import for client components to avoid SSR issues
const AccountButton = dynamic(
  () => import('@/components/AccountButton'),
  { ssr: false }
);

const Background = styled.div`
  width: 100vw;
  height: 100vh;
  background: url('/background.png') center center / cover no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

export default function Home() {
  return (
    <Background>
      <AccountButton />
    </Background>
  );
}
