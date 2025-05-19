"use client";
import React from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';

// Use dynamic import to avoid SSR issues with Supabase client
const SupabaseExample = dynamic(
  () => import('../components/SupabaseExample'),
  { ssr: false }
);

const Background = styled.div`
  width: 100vw;
  height: 100vh;
  background: url('/background.png') center center / cover no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.8);
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
`;

export default function Home() {
  return (
    <Background>
      <Card>
        <SupabaseExample />
      </Card>
    </Background>
  );
}
