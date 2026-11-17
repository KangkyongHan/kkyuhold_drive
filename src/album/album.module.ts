import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlbumService } from './album.service';
import { AlbumController } from './album.controller';
import { Album } from '../entities/album.entity';
import { FileMemory } from '../entities/file-memory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Album, FileMemory])],
  providers: [AlbumService],
  controllers: [AlbumController]
})
export class AlbumModule {}
