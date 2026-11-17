'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Card } from '@/components/ui';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { loading, login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        console.log('로그인 시도 중:', email);
        await login(email, password);
      } else {
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
          <span style={{ color: 'var(--text-muted)' }}>
            {isLogin ? '아직 회원이 아니신가요? ' : '이미 계정이 있으신가요? '}
          </span>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {isLogin ? '회원가입' : '로그인'}
          </button>
        </div>
      </Card>
    </main>
  );
}
