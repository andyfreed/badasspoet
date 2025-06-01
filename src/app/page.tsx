"use client";

import AccountButton from '@/components/AccountButton';

export default function Home() {
  return (
    <div style={{
      height: '100vh',
      overflowY: 'scroll',
      scrollSnapType: 'y mandatory',
      scrollBehavior: 'smooth'
    }}>
      {/* Account Button - Fixed position across all sections */}
      <div style={{ position: 'fixed', zIndex: 1000 }}>
        <AccountButton />
      </div>

      {/* Section 1 - Original Background (clean, no overlay) */}
      <section style={{
        width: '100vw',
        height: '100vh',
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        scrollSnapAlign: 'start'
      }}>
      </section>

      {/* Section 2 - French Connection */}
      <section style={{
        width: '100vw',
        height: '100vh',
        backgroundImage: 'url(/french-connection.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        scrollSnapAlign: 'start',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Content overlay for French Connection section */}
        <div style={{
          textAlign: 'center',
          color: 'white',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          background: 'rgba(0,0,0,0.4)',
          padding: '2rem',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ 
            fontSize: '3rem', 
            margin: '0 0 1rem 0',
            fontWeight: 'bold'
          }}>
            French Connection
          </h2>
          <p style={{ 
            fontSize: '1.3rem', 
            margin: 0,
            opacity: 0.9
          }}>
            Discover the art of expression
          </p>
        </div>
      </section>
    </div>
  );
}
