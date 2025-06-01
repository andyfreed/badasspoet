'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background: url('/background.png') center center / cover no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 600px;
  text-align: center;
`;

const Title = styled.h1`
  margin-bottom: 1rem;
`;

const Message = styled.p`
  margin-bottom: 1.5rem;
`;

const HomeButton = styled.button`
  background-color: #6c63ff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #5a52d9;
  }
`;

export default function ResetPage() {
  const [status, setStatus] = useState<'resetting' | 'success' | 'error'>('resetting');
  const [message, setMessage] = useState('Resetting user data...');
  const router = useRouter();

  useEffect(() => {
    // Reset all usernames to be available
    const resetUserData = async () => {
      try {
        // First sign out any current user
        await supabase.auth.signOut();
        
        // Run the custom function to reset usernames
        const { data, error } = await supabase.rpc('reset_all_usernames');
          
        if (error) {
          console.error('Error resetting usernames:', error);
          setStatus('error');
          setMessage(`Error resetting data: ${error.message}`);
          return;
        }
        
        setStatus('success');
        setMessage('All user data has been reset. All usernames are now available.');
      } catch (err) {
        console.error('Unexpected error during reset:', err);
        setStatus('error');
        setMessage('An unexpected error occurred during reset.');
      }
    };
    
    resetUserData();
  }, []);
  
  const goToHome = () => {
    router.push('/');
  };
  
  return (
    <Container>
      <Card>
        <Title>System Reset</Title>
        <Message>{message}</Message>
        
        {status !== 'resetting' && (
          <HomeButton onClick={goToHome}>Go to Home Page</HomeButton>
        )}
      </Card>
    </Container>
  );
} 