export interface User {
  id: string;
  email: string;
  name: string;
  coupleId?: string | null;
  inviteCode?: string;
}

export interface Album {
  id: string;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  coverFileId?: string | null;
  fileCount: number;
}

export interface DriveFile {
  id: string;
  originalName: string;
  isImage: boolean;
  isFavorite: boolean;
  albumId?: string;
  createdAt: string;
}
