"use client";

import AccountButton from '@/components/AccountButton';

export default function Home() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundImage: 'url(/background.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative'
    }}>
      {/* Account Button in top right */}
      <AccountButton />
    </div>
  );
}
