"use client";

import { useAuth } from '@/context/AuthContext';
import AccountButton from '@/components/AccountButton';
import SupabaseExample from '@/components/SupabaseExample';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '1.2rem' }}>
          Loading BadAssPoet...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
      position: 'relative'
    }}>
      {/* Account Button */}
      <AccountButton />
      
      {/* Main Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '4rem 2rem',
        minHeight: '100vh'
      }}>
        {/* Hero Section */}
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '15px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          textAlign: 'center',
          maxWidth: '600px',
          marginBottom: '2rem'
        }}>
          <h1 style={{ 
            color: '#333', 
            marginBottom: '1.5rem',
            fontSize: '3rem',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🎭 BadAssPoet
          </h1>
          
          <p style={{ 
            color: '#666', 
            marginBottom: '2rem',
            fontSize: '1.2rem',
            lineHeight: '1.6'
          }}>
            {user ? `Welcome back, ${user.email}! ` : 'Welcome to the ultimate poetry platform. '}
            Express yourself through the art of words.
          </p>

          {user ? (
            <div style={{
              background: '#e8f5e8',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #4CAF50',
              marginBottom: '1rem'
            }}>
              <div style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                ✅ You're signed in and ready to create!
              </div>
              <div style={{ color: '#555', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                User ID: {user.id.slice(0, 8)}...
              </div>
            </div>
          ) : (
            <div style={{
              background: '#fff3cd',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #ffc107',
              marginBottom: '1rem'
            }}>
              <div style={{ color: '#856404', fontWeight: 'bold' }}>
                📝 Sign in to start creating and sharing your poetry
              </div>
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: '1.5rem'
          }}>
            <div style={{
              background: '#4CAF50',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>
              ✅ React 19
            </div>
            <div style={{
              background: '#2196F3',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>
              ✅ Next.js 15
            </div>
            <div style={{
              background: '#9C27B0',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>
              ✅ Supabase
            </div>
          </div>
        </div>

        {/* Supabase Connection Status */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '15px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          maxWidth: '800px',
          width: '100%'
        }}>
          <SupabaseExample />
        </div>
      </div>
    </div>
  );
}
