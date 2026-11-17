import { useState, useCallback } from 'react';
import { apiFetch, apiUpload } from '@/lib/api';
import { DriveFile } from '@/types';

export const useGallery = (
  albumId?: string | null,
  favorite?: string | null,
  onSync?: () => void,
) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (albumId) query.append('albumId', albumId);
      if (favorite) query.append('favorite', 'true');
      
      const data = await apiFetch(`/drive/files?${query.toString()}`);
      setFiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [albumId, favorite]);

  const toggleFavorite = async (fileId: string) => {
    try {
      await apiFetch(`/drive/files/${fileId}/favorite`, { method: 'PATCH' });
      await fetchFiles();
      if (onSync) onSync();
    } catch (err: any) {
      throw err;
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      await apiFetch(`/drive/files/${fileId}`, { method: 'DELETE' });
      await fetchFiles();
      if (onSync) onSync();
    } catch (err: any) {
      throw err;
    }
  };

  const moveToAlbum = async (fileId: string, targetAlbumId: string) => {
    try {
      await apiFetch(`/drive/files/${fileId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ albumId: targetAlbumId })
      });
      await fetchFiles();
      if (onSync) onSync();
    } catch (err: any) {
      throw err;
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    let path = '/drive/upload';
    if (albumId) {
      path += `?albumId=${albumId}`;
    }
    
    try {
      await apiUpload(path, formData);
      await fetchFiles();
      if (onSync) onSync();
    } catch (err: any) {
      throw err;
    }
  };

  return { files, loading, fetchFiles, toggleFavorite, deleteFile, moveToAlbum, uploadFile };
};
