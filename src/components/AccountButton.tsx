'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '@/context/AuthContext';
import AuthModal from './AuthModal';

const Button = styled.button`
  background-color: #6c63ff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  position: absolute;
  top: 20px;
  right: 20px;

  &:hover {
    background-color: #5a52d9;
  }
`;

export default function AccountButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleButtonClick = () => {
    if (user) {
      // If user is signed in, show a dropdown or sign out directly
      signOut();
    } else {
      // If no user, open the auth modal
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Button onClick={handleButtonClick}>
        {user ? 'Account' : 'Sign In'}
      </Button>
      
      {isModalOpen && (
        <AuthModal onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
} 