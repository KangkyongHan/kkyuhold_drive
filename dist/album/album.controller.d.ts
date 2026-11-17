import { AlbumService } from './album.service';
import { CreateAlbumDto } from './dto/create-album.dto';
export declare class AlbumController {
    private readonly albumService;
    constructor(albumService: AlbumService);
    create(req: any, createAlbumDto: CreateAlbumDto): Promise<import("../entities/album.entity").Album>;
    findAll(req: any): Promise<{
        albums: {
            fileCount: number;
            id: string;
            name: string;
            couple: import("../entities/couple.entity").Couple;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
            files: import("../entities/file-memory.entity").FileMemory[];
        }[];
        totalFileCount: number;
    }>;
    findOne(req: any, id: string): Promise<import("../entities/album.entity").Album>;
    remove(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
