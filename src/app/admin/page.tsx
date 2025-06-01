'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useAuth } from '@/context/AuthContext';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background: url('/background.png') center center / cover no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const AdminPanel = styled.div`
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 800px;
  text-align: center;
`;

const Title = styled.h1`
  color: #333;
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const SignOutButton = styled.button`
  background-color: #6c63ff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
  
  &:hover {
    background-color: #5a52d9;
  }
`;

export default function AdminPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Show nothing while loading
  if (loading) {
    return null;
  }

  // We shouldn't need this check due to the redirect in useEffect,
  // but it's good practice to have it just in case
  if (!user) {
    return null;
  }

  return (
    <Container>
      <AdminPanel>
        <Title>Admin Section</Title>
        <p>Welcome, {user.email}</p>
        <SignOutButton onClick={() => {
          signOut();
          router.push('/');
        }}>
          Sign Out
        </SignOutButton>
      </AdminPanel>
    </Container>
  );
} 