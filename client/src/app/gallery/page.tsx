'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGallery } from '@/hooks/useGallery';
import { useAlbums } from '@/hooks/useAlbums';
import { Card } from '@/components/ui';

function GalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const albumId = searchParams.get('albumId');
  const favorite = searchParams.get('favorite');
  const { albums, fetchAlbums } = useAlbums();
  const { files, loading, fetchFiles, toggleFavorite, deleteFile, moveToAlbum, uploadFile } = useGallery(albumId, favorite, fetchAlbums);
  const [token, setToken] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem('accessToken'));
    fetchFiles();
    fetchAlbums();
  }, [fetchFiles, fetchAlbums]);

  const handleToggleFavorite = async (fileId: string) => {
    try {
      await toggleFavorite(fileId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('정말로 이 추억을 삭제하시겠습니까?')) return;
    try {
      await deleteFile(fileId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMoveToAlbum = async (fileId: string, targetAlbumId: string) => {
    if (!targetAlbumId) return;
    try {
      await moveToAlbum(fileId, targetAlbumId);
      alert('앨범이 이동되었습니다.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadFile(file);
      alert('업로드가 완료되었습니다!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main>
      <header style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>
          {favorite ? '소중한 추억들' : albumId ? '앨범 기록' : '모든 추억'}
        </h1>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>갤러리를 불러오는 중...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
          {files.map((file) => (
            <div key={file.id} style={{ position: 'relative', aspectRatio: '1/1', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
              {file.isImage ? (
                <img
                  src={`/api/drive/files/${file.id}/view?token=${token}`}
                  alt={file.originalName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onClick={() => window.open(`/api/drive/files/${file.id}/view?token=${token}`, '_blank')}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', textAlign: 'center', padding: '4px' }}>
                  📄 {file.originalName}
                </div>
              )}
              
              <button
                onClick={() => handleToggleFavorite(file.id)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(0,0,0,0.3)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  color: file.isFavorite ? '#ff4757' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px'
                }}
              >
                {file.isFavorite ? '❤️' : '🤍'}
              </button>

              <button
                onClick={() => handleDelete(file.id)}
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  background: 'rgba(255,255,255,0.8)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 4px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                삭제
              </button>

              <select
                onChange={(e) => handleMoveToAlbum(file.id, e.target.value)}
                value={file.albumId || ''}
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  background: 'rgba(255,255,255,0.8)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 4px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  maxWidth: '80px',
                  color: '#4a3e40'
                }}
              >
                <option value="">미분류</option>
                {albums.map((al) => (
                  <option key={al.id} value={al.id}>{al.name}</option>
                ))}
              </select>
            </div>
          ))}
          {files.length === 0 && (
            <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              추억이 아직 없네요. 📸
            </div>
          )}
        </div>
      )}

      {/* Upload button fixed at bottom */}
      <section style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '540px' }}>
        <label className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <span>{uploading ? '업로드 중...' : '📸 현재 앨범에 올리기'}</span>
          <input type="file" hidden onChange={handleUpload} disabled={uploading} />
        </label>
      </section>
    </main>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<div>불러오는 중...</div>}>
      <GalleryContent />
    </Suspense>
  );
}
