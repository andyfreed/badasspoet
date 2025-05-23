'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '@/context/AuthContext';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  min-height: 100vh;
  background: #000;
  color: #fff;
  position: relative;
`;

const Header = styled.header`
  background: rgba(0, 0, 0, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 2rem;
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.8;
  }
`;

const NavSection = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const NavButton = styled.button`
  background: transparent;
  color: #fff;
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }
`;

const Main = styled.main`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  animation: ${fadeIn} 0.6s ease;
`;

const Section = styled.section`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.07);
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const InfoItem = styled.div`
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const InfoLabel = styled.p`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

const InfoValue = styled.p`
  font-size: 1.1rem;
  color: #fff;
  font-weight: 500;
`;

const StatusBadge = styled.span<{ $isAdmin?: boolean }>`
  display: inline-block;
  padding: 4px 12px;
  background: ${props => props.$isAdmin ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.$isAdmin ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 20px;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Button = styled.button`
  background: #fff;
  color: #000;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 1rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(255, 255, 255, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #000;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default function AccountPage() {
  const { user, loading, isAdmin, availableUsernames, signOut } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!loading && !user) {
      router.push('/');
    }
    
    // If user is admin, redirect to admin page
    if (!loading && user && isAdmin) {
      router.push('/admin');
    }
    
    // Get user data
    if (user && availableUsernames.length > 0) {
      const userInfo = availableUsernames.find(u => u.user_id === user.id);
      setUserData(userInfo);
    }
  }, [user, loading, isAdmin, router, availableUsernames]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
      </LoadingContainer>
    );
  }

  // Return null if no user (will redirect)
  if (!user || isAdmin) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container>
      <Header>
        <Logo onClick={() => router.push('/')}>BADASSPOET</Logo>
        <NavSection>
          <NavButton onClick={handleSignOut}>
            Sign Out
          </NavButton>
        </NavSection>
      </Header>

      <Main>
        {/* Account Information */}
        <Section>
          <SectionTitle>
            Account Information
            <StatusBadge>Regular User</StatusBadge>
          </SectionTitle>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>Email Address</InfoLabel>
              <InfoValue>{user.email}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Username</InfoLabel>
              <InfoValue>{userData?.username || 'Not assigned'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Account Created</InfoLabel>
              <InfoValue>{formatDate(user.created_at || user.aud)}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Last Sign In</InfoLabel>
              <InfoValue>{formatDate(user.last_sign_in_at || new Date().toISOString())}</InfoValue>
            </InfoItem>
          </InfoGrid>
        </Section>

        {/* Activity Section */}
        <Section>
          <SectionTitle>Your Activity</SectionTitle>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>Posts Created</InfoLabel>
              <InfoValue>0</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Comments</InfoLabel>
              <InfoValue>0</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Likes Given</InfoLabel>
              <InfoValue>0</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Member Since</InfoLabel>
              <InfoValue>{formatDate(user.created_at || user.aud)}</InfoValue>
            </InfoItem>
          </InfoGrid>
        </Section>

        {/* Account Settings */}
        <Section>
          <SectionTitle>Account Settings</SectionTitle>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem' }}>
            Manage your account preferences and settings.
          </p>
          <Button>Change Password</Button>
        </Section>
      </Main>
    </Container>
  );
} 