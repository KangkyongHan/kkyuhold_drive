import { User } from './user.entity';
export declare class Couple {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    members: User[];
}
