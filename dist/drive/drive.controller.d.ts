import { DriveService } from './drive.service';
import type { FastifyReply } from 'fastify';
export declare class DriveController {
    private readonly driveService;
    constructor(driveService: DriveService);
    upload(req: any, albumId?: string): Promise<import("../entities/file-memory.entity").FileMemory>;
    list(req: any, query: any): Promise<import("../entities/file-memory.entity").FileMemory[]>;
    toggleFavorite(req: any, id: string): Promise<import("../entities/file-memory.entity").FileMemory>;
    moveToAlbum(req: any, id: string, albumId: string): Promise<import("../entities/file-memory.entity").FileMemory>;
    view(req: any, id: string, res: FastifyReply): Promise<void>;
    delete(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
