import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { FileMemory } from '../entities/file-memory.entity';
import { User } from '../entities/user.entity';
import { Album } from '../entities/album.entity';
import { GoogleDriveService } from './google-drive.service';
export declare class DriveService {
    private fileRepository;
    private albumRepository;
    private configService;
    private googleDriveService;
    private readonly logger;
    private readonly baseUploadPath;
    constructor(fileRepository: Repository<FileMemory>, albumRepository: Repository<Album>, configService: ConfigService, googleDriveService: GoogleDriveService);
    uploadFile(user: User, file: any, albumId?: string): Promise<FileMemory>;
    listFiles(user: User, query: {
        type?: string;
        sort?: string;
        order?: 'ASC' | 'DESC';
        albumId?: string;
        favorite?: string;
    }): Promise<FileMemory[]>;
    toggleFavorite(user: User, fileId: string): Promise<FileMemory>;
    moveToAlbum(user: User, fileId: string, albumId: string | null): Promise<FileMemory>;
    getFile(user: User, fileId: string): Promise<{
        stream: import("stream").Readable;
        mimeType: string;
        fileName: string;
    }>;
    softDelete(user: User, fileId: string): Promise<{
        success: boolean;
    }>;
}
