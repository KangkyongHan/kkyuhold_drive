import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { FileMemory } from '../entities/file-memory.entity';
import { User } from '../entities/user.entity';
import { Album } from '../entities/album.entity';
import { GoogleDriveService } from './google-drive.service';

@Injectable()
export class DriveService {
  private readonly logger = new Logger(DriveService.name);
  private readonly baseUploadPath: string;

  constructor(
    @InjectRepository(FileMemory)
    private fileRepository: Repository<FileMemory>,
    @InjectRepository(Album)
    private albumRepository: Repository<Album>,
    private configService: ConfigService,
    private googleDriveService: GoogleDriveService,
  ) {
    this.baseUploadPath = this.configService.get<string>('UPLOAD_PATH', './uploads');
    
    // Ensure base directory exists
    if (!fs.existsSync(this.baseUploadPath)) {
      fs.mkdirSync(this.baseUploadPath, { recursive: true });
    }
  }

  async uploadFile(user: User, file: any, albumId?: string) {
    if (!user.couple) {
      throw new ForbiddenException('커플 연결 후 파일 업로드가 가능합니다.');
    }

    let album: Album | null = null;
    if (albumId) {
      album = await this.albumRepository.findOne({
        where: { id: albumId, couple: { id: user.couple.id } },
      });
    }

    const isImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(
      file.mimetype,
    );

    try {
      const buffer = await file.toBuffer();
      const fileRecord = new FileMemory();
      fileRecord.couple = user.couple;
      fileRecord.uploader = user;
      fileRecord.originalName = file.filename;
      fileRecord.mimeType = file.mimetype;
      fileRecord.size = buffer.length;
      fileRecord.isImage = isImage;
      if (album) fileRecord.album = album;

      // 1. 구글 드라이브가 연동되어 있는 경우 구글 드라이브로 저장
      if (this.googleDriveService.isReady()) {
        const uploadResult = await this.googleDriveService.uploadFile(
          file.filename,
          file.mimetype,
          buffer,
        );
        fileRecord.storageDriver = 'google_drive';
        fileRecord.googleDriveFileId = uploadResult.fileId;
        fileRecord.filePath = `google-drive://${uploadResult.fileId}`;
        this.logger.log(`Google Drive에 파일 업로드 완료: ${file.filename} (${uploadResult.fileId})`);
      } else {
        // 2. 구글 드라이브 설정이 없는 경우 로컬 디스크에 저장
        const coupleId = user.couple.id;
        const now = new Date();
        const year = now.getFullYear().toString();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');

        const targetDir = path.join(this.baseUploadPath, coupleId, year, month);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        const fileExt = path.extname(file.filename);
        const newFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
        const filePath = path.join(targetDir, newFileName);

        fs.writeFileSync(filePath, buffer);

        fileRecord.storageDriver = 'local';
        fileRecord.filePath = filePath;
      }

      return await this.fileRepository.save(fileRecord);
    } catch (error) {
      this.logger.error('파일 저장 중 오류 발생:', error);
      throw new InternalServerErrorException('파일 저장 중 오류가 발생했습니다.');
    }
  }

  async listFiles(
    user: User,
    query: { type?: string; sort?: string; order?: 'ASC' | 'DESC'; albumId?: string; favorite?: string },
  ) {
    if (!user.couple) return [];

    const { type, sort = 'createdAt', order = 'DESC', albumId, favorite } = query;

    const queryBuilder = this.fileRepository
      .createQueryBuilder('file')
      .where('file.coupleId = :coupleId', { coupleId: user.couple.id })
      .andWhere('file.deletedAt IS NULL');

    if (type === 'image') {
      queryBuilder.andWhere('file.isImage = :isImage', { isImage: true });
    } else if (type === 'document') {
      queryBuilder.andWhere('file.isImage = :isImage', { isImage: false });
    }

    if (albumId) {
      queryBuilder.andWhere('file.albumId = :albumId', { albumId });
    }

    if (favorite === 'true') {
      queryBuilder.andWhere('file.isFavorite = :isFav', { isFav: true });
    }

    queryBuilder.orderBy(`file.${sort}`, order);

    return await queryBuilder.getMany();
  }

  async toggleFavorite(user: User, fileId: string) {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['couple'],
    });

    if (!file || file.deletedAt) {
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }

    if (file.couple.id !== user.couple?.id) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    file.isFavorite = !file.isFavorite;
    return await this.fileRepository.save(file);
  }

  async moveToAlbum(user: User, fileId: string, albumId: string | null) {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['couple'],
    });

    if (!file || file.deletedAt) throw new NotFoundException('파일을 찾을 수 없습니다.');
    if (file.couple.id !== user.couple?.id) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    if (!albumId) {
      file.album = null;
    } else {
      const album = await this.albumRepository.findOne({
        where: { id: albumId, couple: { id: user.couple?.id } },
      });
      if (!album) throw new NotFoundException('앨범을 찾을 수 없습니다.');
      file.album = album;
    }

    return await this.fileRepository.save(file);
  }

  async getFile(user: User, fileId: string) {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['couple'],
    });

    if (!file || file.deletedAt) {
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }

    if (file.couple.id !== user.couple?.id) {
      throw new ForbiddenException('해당 파일에 접근 권한이 없습니다.');
    }

    // 1. Google Drive 저장된 파일인 경우
    if (file.storageDriver === 'google_drive' || file.googleDriveFileId) {
      const fileId = file.googleDriveFileId || file.filePath.replace('google-drive://', '');
      try {
        const stream = await this.googleDriveService.getFileStream(fileId);
        return {
          stream,
          mimeType: file.mimeType,
          fileName: file.originalName,
        };
      } catch (err) {
        this.logger.error(`구글 드라이브 파일 스트림 로드 실패 (${fileId}):`, err);
        throw new NotFoundException('구글 드라이브에서 파일을 불러올 수 없습니다.');
      }
    }

    // 2. 로컬 디스크에 저장된 파일인 경우
    if (!fs.existsSync(file.filePath)) {
      throw new NotFoundException('파일이 서버에서 소실되었습니다.');
    }

    return {
      stream: fs.createReadStream(file.filePath),
      mimeType: file.mimeType,
      fileName: file.originalName,
    };
  }

  async softDelete(user: User, fileId: string) {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['couple'],
    });

    if (!file) {
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }

    if (file.couple.id !== user.couple?.id) {
      throw new ForbiddenException('삭제 권한이 없습니다.');
    }

    await this.fileRepository.softDelete(fileId);
    return { success: true };
  }
}
