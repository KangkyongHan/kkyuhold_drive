'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';
import { Button, Input, Card } from '@/components/ui';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [allowSignup, setAllowSignup] = useState<boolean>(true);
  const { loading, login, signup } = useAuth();

  useEffect(() => {
    // 백엔드의 신규 회원가입 허용 상태 확인
    apiFetch('/auth/signup-status')
      .then((res: any) => {
        if (res && typeof res.allowSignup === 'boolean') {
          setAllowSignup(res.allowSignup);
          if (!res.allowSignup) {
            setIsLogin(true); // 가입 차단 상태면 무조건 로그인 폼으로 고정
          }
        }
      })
      .catch(() => {
        // 네트워크 에러 시 기본값 유지
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!allowSignup) {
          alert('현재 신규 회원가입이 마감되었습니다.');
          return;
        }
        await signup(email, password, name);
        alert('회원가입이 완료되었습니다. 로그인해 주세요.');
        setIsLogin(true);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <main style={{ marginTop: '10vh' }}>
      <Card style={{ padding: '40px' }}>
        <h1 style={{ marginBottom: '8px', fontSize: '24px', textAlign: 'center' }}>
          {isLogin ? '우리만의 공간' : '새로운 시작'}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', textAlign: 'center', fontSize: '14px' }}>
          {isLogin ? '다시 돌아오신 걸 환영해요' : '함께할 추억을 담을 준비를 하세요'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <Input
              type="text"
              placeholder="이름"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              required
            />
          )}
          <Input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
          />
          {!isLogin && (
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '-8px' }}>
              🔒 8자 이상, 대/소문자와 숫자 혹은 특수문자를 포함해 주세요.
            </p>
          )}
          <Button type="submit" isLoading={loading} style={{ padding: '16px', fontSize: '16px' }}>
            {isLogin ? '로그인' : '회원가입'}
          </Button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
          {allowSignup ? (
            <>
              <span style={{ color: 'var(--text-muted)' }}>
                {isLogin ? '아직 회원이 아니신가요? ' : '이미 계정이 있으신가요? '}
              </span>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {isLogin ? '회원가입' : '로그인'}
              </button>
            </>
          ) : (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: '#f8f9fa',
              color: '#888',
              fontSize: '12px'
            }}>
              🔒 등록된 커플 전용 프라이빗 공간입니다
            </div>
          )}
        </div>
      </Card>
    </main>
  );
}
