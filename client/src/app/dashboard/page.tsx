'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiUpload } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useAlbums } from '@/hooks/useAlbums';
import { Button, Card } from '@/components/ui';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { albums, totalFileCount, loading: albumsLoading, fetchAlbums, createAlbum, deleteAlbum } = useAlbums();
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/auth');
      return;
    }
    fetchAlbums();
  }, [router, fetchAlbums]);

  const handleCreateAlbum = async () => {
    const name = prompt('앨범 이름을 입력해 주세요.');
    if (!name) return;

    try {
      await createAlbum(name);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteAlbum = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); // Card 클릭 방지
    if (!confirm(`'${name}' 앨범을 삭제하시겠습니까?\n앨범 안의 사진들은 삭제되지 않고 '모든 사진'에서 계속 볼 수 있습니다.`)) {
      return;
    }

    try {
      await deleteAlbum(id);
      alert('앨범이 삭제되었습니다.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiUpload('/drive/upload', formData);
      alert('업로드가 완료되었습니다!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (albumsLoading && albums.length === 0) return <div>계곡을 흐르는 물처럼 로딩 중...</div>;

  return (
    <main>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>{user?.name}님의 공간</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>우리만의 조용한 기록</p>
        </div>
        <button onClick={logout} className="btn">로그아웃</button>
      </header>

      <section style={{ marginBottom: '40px' }}>
        <Card style={{ padding: '24px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => router.push('/gallery')}>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{albums.length}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>앨범</p>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'var(--border)' }} />
          <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => router.push('/gallery')}>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalFileCount}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>전체 추억</p>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'var(--border)' }} />
          <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => router.push('/gallery?favorite=true')}>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>❤️</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>즐겨찾기</p>
          </div>
        </Card>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>추억의 앨범</h2>
          <button onClick={handleCreateAlbum} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 'bold', cursor: 'pointer' }}>+ 새 앨범</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {albums.map((album) => (
            <Card
              key={album.id}
              style={{
                padding: '24px',
                textAlign: 'center',
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={() => router.push(`/gallery?albumId=${album.id}`)}
            >
              <button
                onClick={(e) => handleDeleteAlbum(e, album.id, album.name)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(0,0,0,0.05)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
                title="앨범 삭제"
              >
                ✕
              </button>
              <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{album.name}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{album.fileCount}개의 기록</p>
            </Card>
          ))}
          {albums.length === 0 && (
            <Card style={{ padding: '40px', gridColumn: 'span 2', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              아직 앨범이 없습니다.
            </Card>
          )}
        </div>
      </section>

      <section style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '540px' }}>
        <label className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <span>{uploading ? '업로드 중...' : '📸 추억 올리기'}</span>
          <input type="file" hidden onChange={handleUpload} disabled={uploading} />
        </label>
      </section>
    </main>
  );
}
