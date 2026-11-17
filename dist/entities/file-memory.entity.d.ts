import { Couple } from './couple.entity';
import { User } from './user.entity';
import { Album } from './album.entity';
export declare class FileMemory {
    id: string;
    couple: Couple;
    uploader: User;
    album: Album | null;
    isFavorite: boolean;
    originalName: string;
    filePath: string;
    googleDriveFileId: string;
    storageDriver: string;
    mimeType: string;
    size: number;
    isImage: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
