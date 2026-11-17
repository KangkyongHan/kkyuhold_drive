'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.coupleId) {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/connect';
      }
    } else {
      window.location.href = '/auth';
    }
  }, []);

  return (
    <div style={{ 
      background: 'var(--bg-color)', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      gap: '20px',
      color: 'var(--text-muted)',
      fontSize: '14px'
    }}>
      <p>우리만의 공간으로 연결 중...</p>
      <button 
        onClick={() => { window.location.href = '/auth'; }}
        style={{
          background: 'var(--accent)',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: 'var(--radius)',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '12px'
        }}
      >
        로그인 화면으로 바로가기
      </button>
    </div>
  );
}
