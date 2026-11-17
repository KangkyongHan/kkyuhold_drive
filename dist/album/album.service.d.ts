import { Repository } from 'typeorm';
import { Album } from '../entities/album.entity';
import { User } from '../entities/user.entity';
import { FileMemory } from '../entities/file-memory.entity';
import { CreateAlbumDto } from './dto/create-album.dto';
export declare class AlbumService {
    private albumRepository;
    private fileRepository;
    constructor(albumRepository: Repository<Album>, fileRepository: Repository<FileMemory>);
    create(user: User, dto: CreateAlbumDto): Promise<Album>;
    findAll(user: User): Promise<{
        albums: {
            coverFileId: string | null;
            fileCount: number;
            id: string;
            name: string;
            startDate: string | null;
            endDate: string | null;
            location: string | null;
            latitude: number | null;
            longitude: number | null;
            couple: import("../entities/couple.entity").Couple;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
            files: FileMemory[];
        }[];
        totalFileCount: number;
    }>;
    findOne(user: User, id: string): Promise<Album>;
    remove(user: User, id: string): Promise<{
        success: boolean;
    }>;
}
