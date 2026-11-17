import { Couple } from './couple.entity';
import { FileMemory } from './file-memory.entity';
export declare class Album {
    id: string;
    name: string;
    startDate: string | null;
    endDate: string | null;
    location: string | null;
    latitude: number | null;
    longitude: number | null;
    coverFileId: string | null;
    couple: Couple;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    files: FileMemory[];
}
