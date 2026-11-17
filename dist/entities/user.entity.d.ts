import { Couple } from './couple.entity';
export declare class User {
    id: string;
    email: string;
    password: string;
    name: string;
    inviteCode: string;
    couple: Couple;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
