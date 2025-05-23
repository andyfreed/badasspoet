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
  overflow-x: hidden;
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
  background: linear-gradient(135deg, #fff 0%, #ccc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const NavSection = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const UserInfo = styled.span`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
`;

const SignOutButton = styled.button`
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
  max-width: 1200px;
  margin: 0 auto;
  animation: ${fadeIn} 0.6s ease;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
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
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover {
    transform: translateY(-5px);
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 10px 30px rgba(255, 255, 255, 0.1);
  }
`;

const StatNumber = styled.h2`
  font-size: 3rem;
  font-weight: 700;
  margin: 0;
  color: #fff;
`;

const StatLabel = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0.5rem 0 0 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
`;

const ActionButton = styled.button`
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
  margin-right: 1rem;
  margin-bottom: 1rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(255, 255, 255, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled(ActionButton)`
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
`;

const Tr = styled.tr`
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
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

export default function AdminPage() {
  const { user, loading, signOut, availableUsernames, isAdmin, makeUserAdmin, removeUserAdmin } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 4,
    activeUsers: 2,
    totalPosts: 127,
    pendingReviews: 3
  });

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!loading && !user) {
      router.push('/');
    }
    
    // Redirect to account page if not an admin
    if (!loading && user && !isAdmin) {
      router.push('/account');
    }
  }, [user, loading, isAdmin, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
      </LoadingContainer>
    );
  }

  // Return null if no user or not admin (will redirect)
  if (!user || !isAdmin) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleMakeAdmin = async (userId: string) => {
    const success = await makeUserAdmin(userId);
    if (success) {
      alert('User promoted to admin successfully!');
    } else {
      alert('Failed to promote user. Only admins can perform this action.');
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    const success = await removeUserAdmin(userId);
    if (success) {
      alert('Admin privileges removed successfully!');
    } else {
      alert('Failed to remove admin privileges. Cannot remove the last admin.');
    }
  };

  return (
    <Container>
      <Header>
        <Logo>BADASSPOET ADMIN</Logo>
        <NavSection>
          <UserInfo>Welcome, {user.email}</UserInfo>
          <SignOutButton onClick={handleSignOut}>
            Sign Out
          </SignOutButton>
        </NavSection>
      </Header>

      <Main>
        {/* Dashboard Stats */}
        <DashboardGrid>
          <StatCard>
            <StatNumber>{stats.totalUsers}</StatNumber>
            <StatLabel>Total Users</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.activeUsers}</StatNumber>
            <StatLabel>Active Users</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.totalPosts}</StatNumber>
            <StatLabel>Total Posts</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.pendingReviews}</StatNumber>
            <StatLabel>Pending Reviews</StatLabel>
          </StatCard>
        </DashboardGrid>

        {/* Content Management */}
        <Section>
          <SectionTitle>Content Management</SectionTitle>
          <div>
            <ActionButton>Create New Post</ActionButton>
            <SecondaryButton>Manage Posts</SecondaryButton>
            <SecondaryButton>Moderate Comments</SecondaryButton>
          </div>
        </Section>

        {/* User Management */}
        <Section>
          <SectionTitle>User Management</SectionTitle>
          <Table>
            <thead>
              <tr>
                <Th>Username</Th>
                <Th>Status</Th>
                <Th>Role</Th>
                <Th>User ID</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {availableUsernames.map((username) => (
                <Tr key={username.id}>
                  <Td>{username.username}</Td>
                  <Td>{username.is_taken ? 'Active' : 'Available'}</Td>
                  <Td>
                    {username.is_admin ? (
                      <span style={{ color: '#4CAF50' }}>Admin</span>
                    ) : (
                      <span style={{ color: '#999' }}>User</span>
                    )}
                  </Td>
                  <Td>{username.user_id ? username.user_id.substring(0, 8) + '...' : '-'}</Td>
                  <Td>
                    {username.user_id && username.user_id !== user.id && (
                      <>
                        {username.is_admin ? (
                          <SecondaryButton 
                            style={{ padding: '6px 12px', fontSize: '14px' }}
                            onClick={() => handleRemoveAdmin(username.user_id!)}
                          >
                            Remove Admin
                          </SecondaryButton>
                        ) : (
                          <SecondaryButton 
                            style={{ padding: '6px 12px', fontSize: '14px' }}
                            onClick={() => handleMakeAdmin(username.user_id!)}
                          >
                            Make Admin
                          </SecondaryButton>
                        )}
                      </>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Section>

        {/* Site Settings */}
        <Section>
          <SectionTitle>Site Settings</SectionTitle>
          <div>
            <SecondaryButton>General Settings</SecondaryButton>
            <SecondaryButton>SEO Settings</SecondaryButton>
            <SecondaryButton>Email Templates</SecondaryButton>
            <SecondaryButton>Backup Data</SecondaryButton>
          </div>
        </Section>
      </Main>
    </Container>
  );
} 