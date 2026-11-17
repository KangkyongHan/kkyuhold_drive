import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Album } from '../entities/album.entity';
import { User } from '../entities/user.entity';
import { FileMemory } from '../entities/file-memory.entity';
import { CreateAlbumDto } from './dto/create-album.dto';

@Injectable()
export class AlbumService {
  constructor(
    @InjectRepository(Album)
    private albumRepository: Repository<Album>,
    @InjectRepository(FileMemory)
    private fileRepository: Repository<FileMemory>,
  ) {}

  async create(user: User, dto: CreateAlbumDto) {
    if (!user.couple) {
      throw new ForbiddenException('커플 연결 후 앨범 생성이 가능합니다.');
    }

    const album = this.albumRepository.create({
      name: dto.name,
      startDate: dto.startDate || null,
      endDate: dto.endDate || null,
      location: dto.location || null,
      latitude: dto.latitude || null,
      longitude: dto.longitude || null,
      coverFileId: dto.coverFileId || null,
      couple: user.couple,
    });

    return await this.albumRepository.save(album);
  }

  async findAll(user: User) {
    if (!user.couple) return { albums: [], totalFileCount: 0 };

    const [albums, totalFileCount] = await Promise.all([
      this.albumRepository
        .createQueryBuilder('album')
        .leftJoin('album.files', 'file')
        .select([
          'album.id',
          'album.name',
          'album.startDate',
          'album.endDate',
          'album.location',
          'album.latitude',
          'album.longitude',
          'album.coverFileId',
          'album.createdAt',
        ])
        .addSelect('COUNT(file.id)', 'album_fileCount')
        .where('album.coupleId = :coupleId', { coupleId: user.couple.id })
        .groupBy('album.id')
        .orderBy('album.createdAt', 'DESC')
        .getRawAndEntities(),
      this.fileRepository.count({
        where: { couple: { id: user.couple.id }, deletedAt: null as any },
      }),
    ]);

    // 각 앨범별 최신 사진 1장을 조회하여 커버 이미지로 사용
    const albumsWithCounts = await Promise.all(
      albums.entities.map(async (album, index) => {
        let coverFileId = album.coverFileId;
        if (!coverFileId) {
          const latestFile = await this.fileRepository.findOne({
            where: { album: { id: album.id }, isImage: true },
            order: { createdAt: 'DESC' },
          });
          if (latestFile) {
            coverFileId = latestFile.id;
          }
        }

        return {
          ...album,
          coverFileId,
          fileCount: parseInt(albums.raw[index].album_fileCount || '0', 10),
        };
      }),
    );

    return {
      albums: albumsWithCounts,
      totalFileCount,
    };
  }

  async findOne(user: User, id: string) {
    const album = await this.albumRepository.findOne({
      where: { id },
      relations: ['couple', 'files'],
    });

    if (!album || album.deletedAt) {
      throw new NotFoundException('앨범을 찾을 수 없습니다.');
    }

    if (album.couple.id !== user.couple?.id) {
      throw new ForbiddenException('해당 앨범에 접근 권한이 없습니다.');
    }

    return album;
  }

  async remove(user: User, id: string) {
    const album = await this.albumRepository.findOne({
      where: { id },
      relations: ['couple'],
    });

    if (!album) {
      throw new NotFoundException('앨범을 찾을 수 없습니다.');
    }

    if (album.couple.id !== user.couple?.id) {
      throw new ForbiddenException('삭제 권한이 없습니다.');
    }

    await this.albumRepository.softDelete(id);
    return { success: true };
  }
}
