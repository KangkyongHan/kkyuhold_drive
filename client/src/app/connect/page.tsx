'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Button, Input, Card } from '@/components/ui';

export default function ConnectPage() {
  const [inviteCode, setInviteCode] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/auth');
      return;
    }
    const user = JSON.parse(userStr);
    setInviteCode(user.inviteCode);
  }, [router]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiFetch('/auth/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: partnerCode }),
      });
      alert('연결이 완성되었습니다! 우리만의 공간을 시작해 보세요.');
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ marginTop: '10vh' }}>
      <Card style={{ padding: '40px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '8px', fontSize: '24px' }}>연결할 준비가 되셨나요?</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '14px' }}>
          상대방에게 나의 코드를 알려주거나,<br />상대방의 코드를 아래에 입력해 주세요.
        </p>

        <div style={{ background: 'var(--accent-soft)', padding: '24px', borderRadius: 'var(--radius)', marginBottom: '40px' }}>
          <p style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '8px', fontWeight: 'bold' }}>나의 초대 코드</p>
          <p style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '4px', color: 'var(--accent)' }}>{inviteCode}</p>
        </div>

        <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            type="text"
            placeholder="상대방의 6자리 코드 입력"
            maxLength={6}
            value={partnerCode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPartnerCode(e.target.value.toUpperCase())}
            required
            style={{ textAlign: 'center', letterSpacing: '2px', fontWeight: 'bold' }}
          />
          <Button type="submit" isLoading={loading}>
            공간 연결하기
          </Button>
        </form>
      </Card>
    </main>
  );
}
