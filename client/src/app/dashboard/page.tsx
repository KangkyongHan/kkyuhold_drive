'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiUpload, getFileViewUrl } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useAlbums, CreateAlbumParams } from '@/hooks/useAlbums';
import { Button, Card, Input } from '@/components/ui';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { albums, totalFileCount, loading: albumsLoading, fetchAlbums, createAlbum, deleteAlbum } = useAlbums();
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAlbum, setNewAlbum] = useState<CreateAlbumParams>({
    name: '',
    startDate: '',
    endDate: '',
    location: '',
  });
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/auth');
      return;
    }
    setToken(localStorage.getItem('accessToken'));
    fetchAlbums();
  }, [router, fetchAlbums]);

  const handleOpenModal = () => {
    setNewAlbum({ name: '', startDate: '', endDate: '', location: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbum.name.trim()) {
      alert('앨범 이름을 입력해 주세요!');
      return;
    }

    try {
      await createAlbum(newAlbum);
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || '앨범 생성에 실패했습니다.');
    }
  };

  const handleDeleteAlbum = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); // Card 클릭 방지
    if (!confirm(`'${name}' 앨범을 삭제하시겠습니까?\n앨범 안의 사진들은 삭제되지 않고 '전체 추억'에서 계속 볼 수 있습니다.`)) {
      return;
    }

    try {
      await deleteAlbum(id);
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
      alert('소중한 추억이 업로드되었습니다! ❤️');
      fetchAlbums();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const formatDateRange = (start?: string | null, end?: string | null) => {
    if (!start && !end) return null;
    if (start && end && start !== end) {
      return `${start} ~ ${end}`;
    }
    return start || end;
  };

  if (albumsLoading && albums.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
        🌸 추억의 서랍을 여는 중...
      </div>
    );
  }

  return (
    <main style={{ paddingBottom: '100px' }}>
      {/* 헤더 */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text-main, #333)' }}>
            {user?.name ? `${user.name}님의 기록함 🌸` : '우리만의 공간 🌸'}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted, #888)', marginTop: '2px' }}>
            함께 걸어온 모든 발걸음과 추억들
          </p>
        </div>
        <button
          onClick={logout}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            border: '1px solid var(--border, #e8d5d8)',
            background: 'white',
            fontSize: '12px',
            cursor: 'pointer',
            color: 'var(--text-muted, #777)',
          }}
        >
          로그아웃
        </button>
      </header>

      {/* 요약 대시보드 카드 */}
      <section style={{ marginBottom: '32px' }}>
        <Card style={{ padding: '20px 16px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', boxShadow: '0 4px 15px rgba(255,182,193,0.15)' }}>
          <div style={{ textAlign: 'center', cursor: 'pointer', flex: 1 }} onClick={() => router.push('/gallery')}>
            <p style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--accent, #e75480)' }}>{albums.length}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>✈️ 여행 앨범</p>
          </div>
          <div style={{ width: '1px', height: '36px', background: 'var(--border, #f0e0e4)' }} />
          <div style={{ textAlign: 'center', cursor: 'pointer', flex: 1 }} onClick={() => router.push('/gallery')}>
            <p style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--accent, #e75480)' }}>{totalFileCount}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📷 전체 사진</p>
          </div>
          <div style={{ width: '1px', height: '36px', background: 'var(--border, #f0e0e4)' }} />
          <div style={{ textAlign: 'center', cursor: 'pointer', flex: 1 }} onClick={() => router.push('/gallery?favorite=true')}>
            <p style={{ fontSize: '22px', fontWeight: 'bold' }}>❤️</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>소중한 기억</p>
          </div>
        </Card>
      </section>

      {/* 여행 앨범 섹션 */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main, #333)' }}>
              여행 & 데이트 앨범
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              장소와 날짜별로 모아보는 우리들의 이야기
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: 'linear-gradient(135deg, #ff85a2, #ffacb8)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(255,133,162,0.3)',
            }}
          >
            + 새 여행 앨범
          </button>
        </div>

        {/* 앨범 그리드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
          {albums.map((album) => {
            const coverUrl = album.coverFileId ? getFileViewUrl(album.coverFileId, token) : null;
            const dateStr = formatDateRange(album.startDate, album.endDate);

            return (
              <div
                key={album.id}
                onClick={() => router.push(`/gallery?albumId=${album.id}`)}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  border: '1px solid rgba(255, 182, 193, 0.3)',
                }}
              >
                {/* 커버 썸네일 */}
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '4/3',
                    background: coverUrl
                      ? `url("${coverUrl}") center/cover no-repeat`
                      : 'linear-gradient(135deg, #ffeef2, #ffd6df)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {!coverUrl && (
                    <span style={{ fontSize: '32px', opacity: 0.6 }}>🌴</span>
                  )}

                  {/* 삭제 버튼 */}
                  <button
                    onClick={(e) => handleDeleteAlbum(e, album.id, album.name)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(0,0,0,0.35)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      fontSize: '11px',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="앨범 삭제"
                  >
                    ✕
                  </button>

                  {/* 사진 수 뱃지 */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      background: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      backdropFilter: 'blur(2px)',
                    }}
                  >
                    📷 {album.fileCount}
                  </span>
                </div>

                {/* 앨범 정보 */}
                <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '14px', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {album.name}
                  </p>

                  {album.location && (
                    <p style={{ fontSize: '11px', color: '#ff6b8b', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      📍 {album.location}
                    </p>
                  )}

                  {dateStr && (
                    <p style={{ fontSize: '11px', color: 'var(--text-muted, #888)' }}>
                      🗓️ {dateStr}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {albums.length === 0 && (
            <Card style={{ padding: '50px 20px', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', background: 'white' }}>
              <p style={{ fontSize: '36px', marginBottom: '8px' }}>✈️</p>
              <p style={{ fontWeight: 'bold', marginBottom: '4px', color: '#444' }}>아직 등록된 여행 앨범이 없습니다.</p>
              <p style={{ fontSize: '12px' }}>위의 [+ 새 여행 앨범] 버튼을 눌러 첫 여행을 기록해 보세요!</p>
            </Card>
          )}
        </div>
      </section>

      {/* 하단 업로드 고정 버튼 */}
      <section style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '500px', zIndex: 10 }}>
        <label
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 24px',
            borderRadius: '30px',
            background: 'linear-gradient(135deg, #ff758c, #ff7eb3)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '15px',
            boxShadow: '0 8px 24px rgba(255,117,140,0.4)',
            cursor: uploading ? 'not-allowed' : 'pointer',
          }}
        >
          <span>{uploading ? '구글 드라이브에 안전하게 보관 중... ⏳' : '📸 오늘의 추억 올리기'}</span>
          <input type="file" hidden onChange={handleUpload} disabled={uploading} accept="image/*" />
        </label>
      </section>

      {/* 새 여행 앨범 생성 모달 팝업 */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '24px',
              width: '100%',
              maxWidth: '380px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: '#333' }}>✈️ 새 여행 앨범 만들기</h3>
              <button
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#999' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAlbum} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '6px' }}>
                  여행 이름 <span style={{ color: '#ff4757' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="예) 제주도 힐링 여행, 경주 벚꽃 데이트"
                  value={newAlbum.name}
                  onChange={(e) => setNewAlbum({ ...newAlbum, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #e0e0e0',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  autoFocus
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '6px' }}>
                  📍 여행지 / 장소
                </label>
                <input
                  type="text"
                  placeholder="예) 제주특별자치도, 강릉 안목해변"
                  value={newAlbum.location}
                  onChange={(e) => setNewAlbum({ ...newAlbum, location: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #e0e0e0',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '6px' }}>
                    🗓️ 시작일
                  </label>
                  <input
                    type="date"
                    value={newAlbum.startDate}
                    onChange={(e) => setNewAlbum({ ...newAlbum, startDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: '1px solid #e0e0e0',
                      fontSize: '12px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '6px' }}>
                    🗓️ 종료일
                  </label>
                  <input
                    type="date"
                    value={newAlbum.endDate}
                    onChange={(e) => setNewAlbum({ ...newAlbum, endDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: '1px solid #e0e0e0',
                      fontSize: '12px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #eee',
                    background: '#f8f8f8',
                    color: '#666',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ff85a2, #ffacb8)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(255,133,162,0.3)',
                  }}
                >
                  만들기 ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
