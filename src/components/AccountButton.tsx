'use client';

import { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '@/context/AuthContext';
import AuthModal from './AuthModal';
import { useRouter } from 'next/navigation';

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const ButtonContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
`;

const Button = styled.button`
  background: #000;
  color: #fff;
  padding: 10px 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  overflow: hidden;
  background-image: linear-gradient(
    90deg,
    #000 25%,
    rgba(255, 255, 255, 0.1) 50%,
    #000 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 3s ease-in-out infinite;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.1);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.6);
    transform: translateY(-2px);
    box-shadow: 
      0 5px 15px rgba(255, 255, 255, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    animation-play-state: paused;
    
    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(255, 255, 255, 0.1);
  }
`;

const Dropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: #000;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  overflow: hidden;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.2s ease;
  min-width: 200px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  color: #fff;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  font-size: 14px;
  text-align: left;
  transition: background 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const UserEmail = styled.div`
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

export default function AccountButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, signOut, loading, isAdmin } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleButtonClick = () => {
    if (user) {
      // Toggle dropdown for signed-in users
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      // Open auth modal for non-signed-in users
      setIsModalOpen(true);
    }
  };

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    await signOut();
    router.push('/');
  };

  const handleGoToAdmin = () => {
    setIsDropdownOpen(false);
    router.push('/admin');
  };

  const handleGoToAccount = () => {
    setIsDropdownOpen(false);
    router.push('/account');
  };

  // Don't show anything while checking auth status
  if (loading) {
    return null;
  }

  return (
    <ButtonContainer ref={dropdownRef}>
      <Button onClick={handleButtonClick}>
        {user ? 'Account' : 'Sign In'}
      </Button>
      
      {user && (
        <Dropdown $isOpen={isDropdownOpen}>
          <UserEmail>{user.email}</UserEmail>
          {isAdmin ? (
            <DropdownItem onClick={handleGoToAdmin}>
              Admin Dashboard
            </DropdownItem>
          ) : (
            <DropdownItem onClick={handleGoToAccount}>
              My Account
            </DropdownItem>
          )}
          <DropdownItem onClick={handleSignOut}>
            Sign Out
          </DropdownItem>
        </Dropdown>
      )}
      
      {isModalOpen && (
        <AuthModal onClose={() => setIsModalOpen(false)} />
      )}
    </ButtonContainer>
  );
} 