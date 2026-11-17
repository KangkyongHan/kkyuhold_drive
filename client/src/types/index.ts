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
