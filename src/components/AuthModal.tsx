'use client';

import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const pulseGlow = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
`;

// Modal container
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease;
`;

const ModalContent = styled.div`
  background-color: #000;
  background-image: 
    radial-gradient(ellipse at top right, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at bottom left, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  width: 100%;
  max-width: 450px;
  overflow: hidden;
  position: relative;
  animation: ${slideIn} 0.3s ease;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  color: #fff;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 18px;
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.05)' : 'transparent'};
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: ${props => props.$active ? '600' : '400'};
  color: ${props => props.$active ? '#fff' : 'rgba(255, 255, 255, 0.6)'};
  border-bottom: 2px solid ${props => props.$active ? '#fff' : 'transparent'};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
  }
`;

const Form = styled.form`
  padding: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 16px;
  color: #fff;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background: #fff;
  color: #000;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(255, 255, 255, 0.2);
    animation: ${pulseGlow} 1.5s infinite;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.3);
    cursor: not-allowed;
    animation: none;
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 14px;
  margin-top: 8px;
  padding: 10px;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.2);
  border-radius: 6px;
`;

const UsernameSection = styled.div`
  margin-top: 24px;
  margin-bottom: 24px;
`;

const UsernameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 12px;
`;

const UsernameOption = styled.div<{ $isTaken: boolean; $isSelected: boolean }>`
  padding: 12px;
  border: 1px solid ${props => 
    props.$isSelected ? '#fff' : 
    props.$isTaken ? 'rgba(255, 255, 255, 0.1)' : 
    'rgba(255, 255, 255, 0.2)'
  };
  border-radius: 8px;
  background-color: ${props => {
    if (props.$isTaken) return 'rgba(255, 255, 255, 0.02)';
    if (props.$isSelected) return 'rgba(255, 255, 255, 0.1)';
    return 'rgba(255, 255, 255, 0.05)';
  }};
  cursor: ${props => props.$isTaken ? 'not-allowed' : 'pointer'};
  color: ${props => 
    props.$isTaken ? 'rgba(255, 255, 255, 0.3)' : 
    props.$isSelected ? '#fff' : 
    'rgba(255, 255, 255, 0.8)'
  };
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  ${props => !props.$isTaken && `
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width 0.6s ease, height 0.6s ease;
    }
    
    &:hover::before {
      width: 200%;
      height: 200%;
    }
  `}
  
  &:hover {
    ${props => !props.$isTaken && `
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(255, 255, 255, 0.1);
    `}
  }
`;

type AuthModalProps = {
  onClose: () => void;
};

export default function AuthModal({ onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, availableUsernames, selectedUsername, setSelectedUsername, fetchUsernames } = useAuth();
  const router = useRouter();

  // Debug logging
  console.log('AuthModal - Available usernames:', availableUsernames);
  console.log('AuthModal - Selected username:', selectedUsername);

  // Fetch usernames when modal opens
  useEffect(() => {
    fetchUsernames();
  }, []);

  const handleTabChange = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    setError(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        // Redirect to admin page on successful login
        router.push('/admin');
        onClose();
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!selectedUsername) {
      setError('Please select a username');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await signUp(email, password, selectedUsername);
      
      if (error) {
        setError(error.message);
      } else {
        // Redirect to admin page on successful registration
        router.push('/admin');
        onClose();
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameSelect = (username: string) => {
    setSelectedUsername(username);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        
        <Tabs>
          <Tab 
            $active={activeTab === 'signin'} 
            onClick={() => handleTabChange('signin')}
          >
            Sign In
          </Tab>
          <Tab 
            $active={activeTab === 'signup'} 
            onClick={() => handleTabChange('signup')}
          >
            Create Account
          </Tab>
        </Tabs>
        
        {activeTab === 'signin' ? (
          <Form onSubmit={handleSignIn}>
            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </FormGroup>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <Button type="submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Form>
        ) : (
          <Form onSubmit={handleSignUp}>
            <FormGroup>
              <Label htmlFor="signup-email">Email</Label>
              <Input 
                id="signup-email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="signup-password">Password</Label>
              <Input 
                id="signup-password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </FormGroup>
            
            <UsernameSection>
              <Label>Select a Username</Label>
              <UsernameGrid>
                {availableUsernames.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>
                    Loading usernames...
                  </div>
                ) : (
                  availableUsernames.map(item => (
                    <UsernameOption 
                      key={item.id}
                      $isTaken={item.is_taken}
                      $isSelected={selectedUsername === item.username}
                      onClick={() => !item.is_taken && handleUsernameSelect(item.username)}
                    >
                      {item.username}
                    </UsernameOption>
                  ))
                )}
              </UsernameGrid>
            </UsernameSection>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <Button type="submit" disabled={loading || !selectedUsername}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Form>
        )}
      </ModalContent>
    </ModalOverlay>
  );
} 