import { useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { Album } from '@/types';

export const useAlbums = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [totalFileCount, setTotalFileCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/albums');
      // data is now { albums: Album[], totalFileCount: number }
      setAlbums(data.albums || []);
      setTotalFileCount(data.totalFileCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAlbum = async (name: string) => {
    try {
      await apiFetch('/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      await fetchAlbums();
    } catch (err: any) {
      throw err;
    }
  };

  const deleteAlbum = async (id: string) => {
    try {
      await apiFetch(`/albums/${id}`, { method: 'DELETE' });
      await fetchAlbums();
    } catch (err: any) {
      throw err;
    }
  };

  return { albums, totalFileCount, loading, fetchAlbums, createAlbum, deleteAlbum };
};
