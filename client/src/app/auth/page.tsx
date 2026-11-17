'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch, BASE_URL } from '@/lib/api';
import { Button, Input, Card } from '@/components/ui';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [allowSignup, setAllowSignup] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { loading, login, signup } = useAuth();

  useEffect(() => {
    // 백엔드의 신규 회원가입 허용 상태 확인
    apiFetch('/auth/signup-status')
      .then((res: any) => {
        if (res && typeof res.allowSignup === 'boolean') {
          setAllowSignup(res.allowSignup);
        }
      })
      .catch((err) => {
        console.warn('signup-status check fallback:', err);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 기본 필수값 클라이언트 검증
    if (!email.trim() || !password.trim()) {
      setErrorMessage('이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }

    if (!isLogin && !name.trim()) {
      setErrorMessage('이름을 입력해 주세요.');
      return;
    }

    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        if (!allowSignup) {
          setErrorMessage('현재 신규 회원가입이 마감되었습니다.');
          return;
        }
        await signup(email.trim(), password, name.trim());
        alert('🎉 회원가입이 완료되었습니다!\n방금 만드신 계정으로 로그인해 주세요.');
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMessage(err.message || '인증 중 오류가 발생했습니다.');
    }
  };

  return (
    <main style={{ marginTop: '8vh', padding: '0 16px' }}>
      <Card style={{ padding: '36px 24px', maxWidth: '420px', margin: '0 auto', boxShadow: '0 8px 30px rgba(255,182,193,0.2)' }}>
        <h1 style={{ marginBottom: '6px', fontSize: '24px', textAlign: 'center', color: '#333' }}>
          {isLogin ? '우리만의 공간 🌸' : '새로운 시작 ✨'}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', textAlign: 'center', fontSize: '13px' }}>
          {isLogin ? '다시 돌아오신 걸 환영해요' : '두 분만의 소중한 추억을 담을 준비를 하세요'}
        </p>

        {/* 로그인 / 회원가입 상단 탭 전환 버튼 */}
        <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => { setIsLogin(true); setErrorMessage(null); }}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '10px',
              fontWeight: isLogin ? 'bold' : 'normal',
              background: isLogin ? 'white' : 'transparent',
              color: isLogin ? 'var(--accent, #ff758c)' : '#777',
              boxShadow: isLogin ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setErrorMessage(null); }}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '10px',
              fontWeight: !isLogin ? 'bold' : 'normal',
              background: !isLogin ? 'white' : 'transparent',
              color: !isLogin ? 'var(--accent, #ff758c)' : '#777',
              boxShadow: !isLogin ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
          >
            회원가입
          </button>
        </div>

        {/* 에러 메시지 빨간 박스 */}
        {errorMessage && (
          <div style={{
            background: '#fff0f0',
            border: '1px solid #ffd0d0',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '18px',
            color: '#e74c3c',
            fontSize: '12px',
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap',
          }}>
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!isLogin && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '4px' }}>이름</label>
              <Input
                type="text"
                placeholder="예) 규, 솔"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '4px' }}>이메일</label>
            <Input
              type="email"
              placeholder="예) love@couple.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '4px' }}>비밀번호</label>
            <Input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
            {!isLogin && (
              <p style={{ fontSize: '11px', color: '#888', marginTop: '6px', lineHeight: '1.4' }}>
                🔒 최소 8자 이상, <b>영문 대문자, 소문자, 숫자(또는 특수문자)</b>를 모두 포함해 주세요. (예: <code>Love2026!</code>)
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #ff758c, #ff7eb3)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '15px',
              marginTop: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(255,117,140,0.3)',
            }}
          >
            {loading ? '처리 중... ⏳' : isLogin ? '로그인' : '회원가입 완료하기 ✨'}
          </button>
        </form>

        {/* 연결 상태 디버그 뱃지 */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '11px', color: '#aaa' }}>
          연결 백엔드: <code style={{ fontSize: '10px' }}>{BASE_URL}</code>
        </div>
      </Card>
    </main>
  );
}
