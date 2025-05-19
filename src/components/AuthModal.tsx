'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Modal container
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 450px;
  overflow: hidden;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  z-index: 1;
  
  &:hover {
    color: #333;
  }
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: ${props => props.$active ? '600' : '400'};
  color: ${props => props.$active ? '#6c63ff' : '#666'};
  border-bottom: 2px solid ${props => props.$active ? '#6c63ff' : 'transparent'};
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

const Form = styled.form`
  padding: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #6c63ff;
    box-shadow: 0 0 0 2px rgba(108, 99, 255, 0.2);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #6c63ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #5a52d9;
  }
  
  &:disabled {
    background-color: #b5b2e6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e53935;
  font-size: 14px;
  margin-top: 5px;
`;

const UsernameSection = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
`;

const UsernameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 10px;
`;

const UsernameOption = styled.div<{ $isTaken: boolean; $isSelected: boolean }>`
  padding: 10px;
  border: 1px solid ${props => props.$isSelected ? '#6c63ff' : '#ddd'};
  border-radius: 4px;
  background-color: ${props => {
    if (props.$isTaken) return '#f5f5f5';
    if (props.$isSelected) return 'rgba(108, 99, 255, 0.1)';
    return 'white';
  }};
  cursor: ${props => props.$isTaken ? 'not-allowed' : 'pointer'};
  color: ${props => props.$isTaken ? '#aaa' : '#333'};
  text-align: center;
  
  &:hover {
    background-color: ${props => 
      props.$isTaken 
        ? '#f5f5f5' 
        : props.$isSelected 
          ? 'rgba(108, 99, 255, 0.15)' 
          : '#f9f9f9'
    };
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
  
  const { signIn, signUp, availableUsernames, selectedUsername, setSelectedUsername } = useAuth();
  const router = useRouter();

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
                {availableUsernames.map(item => (
                  <UsernameOption 
                    key={item.id}
                    $isTaken={item.is_taken}
                    $isSelected={selectedUsername === item.username}
                    onClick={() => !item.is_taken && handleUsernameSelect(item.username)}
                  >
                    {item.username}
                  </UsernameOption>
                ))}
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