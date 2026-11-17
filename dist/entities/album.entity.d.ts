import { Couple } from './couple.entity';
import { FileMemory } from './file-memory.entity';
export declare class Album {
    id: string;
    name: string;
    couple: Couple;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    files: FileMemory[];
}
