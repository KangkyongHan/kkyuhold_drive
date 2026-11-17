import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Couple } from './couple.entity';
import { FileMemory } from './file-memory.entity';

@Entity('albums')
export class Album {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  startDate: string | null;

  @Column({ type: 'varchar', nullable: true })
  endDate: string | null;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @Column({ type: 'float', nullable: true })
  latitude: number | null;

  @Column({ type: 'float', nullable: true })
  longitude: number | null;

  @Column({ type: 'varchar', nullable: true })
  coverFileId: string | null;

  @ManyToOne(() => Couple)
  couple: Couple;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => FileMemory, (file) => file.album)
  files: FileMemory[];
}
