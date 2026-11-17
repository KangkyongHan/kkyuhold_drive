import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Couple } from './couple.entity';
import { User } from './user.entity';
import { Album } from './album.entity';

@Entity('files')
export class FileMemory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Couple)
  couple: Couple;

  @ManyToOne(() => User)
  uploader: User;

  @ManyToOne(() => Album, (album) => album.files, { nullable: true })
  album: Album | null;

  @Column({ default: false })
  isFavorite: boolean;

  @Column()
  originalName: string;

  @Column()
  filePath: string;

  @Column({ nullable: true })
  googleDriveFileId: string;

  @Column({ default: 'local' })
  storageDriver: string;

  @Column()
  mimeType: string;

  @Column() // SQLite supports bigint via standard number/string, TypeORM handles mapping
  size: number;

  @Column({ default: false })
  isImage: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
