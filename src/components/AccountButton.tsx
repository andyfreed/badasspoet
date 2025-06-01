'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from './AuthModal';

const buttonStyle = {
  backgroundColor: '#6c63ff',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px',
  transition: 'all 0.2s ease',
  position: 'absolute' as const,
  top: '20px',
  right: '20px',
  zIndex: 1000,
  boxShadow: '0 2px 8px rgba(108, 99, 255, 0.2)',
};

const buttonHoverStyle = {
  ...buttonStyle,
  backgroundColor: '#5a52d9',
  transform: 'translateY(-1px)',
  boxShadow: '0 4px 12px rgba(108, 99, 255, 0.3)',
};

export default function AccountButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { user, signOut } = useAuth();

  const handleButtonClick = () => {
    if (user) {
      // If user is signed in, sign out
      signOut();
    } else {
      // If no user, open the auth modal
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <button 
        onClick={handleButtonClick}
        style={isHovered ? buttonHoverStyle : buttonStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {user ? `👋 ${user.email?.split('@')[0]} (Sign Out)` : '🎭 Sign In'}
      </button>
      
      {isModalOpen && (
        <AuthModal onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
} 