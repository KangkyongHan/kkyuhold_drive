import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
export declare class GoogleDriveService {
    private readonly configService;
    private readonly logger;
    private driveClient;
    private folderIdCache;
    private isConfigured;
    constructor(configService: ConfigService);
    private initClient;
    isReady(): boolean;
    getOrCreateFolder(folderName?: string): Promise<string>;
    uploadFile(fileName: string, mimeType: string, buffer: Buffer, parentFolderName?: string): Promise<{
        fileId: string;
        webViewLink?: string;
    }>;
    getFileStream(fileId: string): Promise<Readable>;
    deleteFile(fileId: string): Promise<void>;
}
