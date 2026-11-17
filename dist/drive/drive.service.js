"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DriveService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriveService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const file_memory_entity_1 = require("../entities/file-memory.entity");
const album_entity_1 = require("../entities/album.entity");
const google_drive_service_1 = require("./google-drive.service");
let DriveService = DriveService_1 = class DriveService {
    fileRepository;
    albumRepository;
    configService;
    googleDriveService;
    logger = new common_1.Logger(DriveService_1.name);
    baseUploadPath;
    constructor(fileRepository, albumRepository, configService, googleDriveService) {
        this.fileRepository = fileRepository;
        this.albumRepository = albumRepository;
        this.configService = configService;
        this.googleDriveService = googleDriveService;
        this.baseUploadPath = this.configService.get('UPLOAD_PATH', './uploads');
        if (!fs.existsSync(this.baseUploadPath)) {
            fs.mkdirSync(this.baseUploadPath, { recursive: true });
        }
    }
    async uploadFile(user, file, albumId) {
        if (!user.couple) {
            throw new common_1.ForbiddenException('커플 연결 후 파일 업로드가 가능합니다.');
        }
        let album = null;
        if (albumId) {
            album = await this.albumRepository.findOne({
                where: { id: albumId, couple: { id: user.couple.id } },
            });
        }
        const isImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype);
        try {
            const buffer = await file.toBuffer();
            const fileRecord = new file_memory_entity_1.FileMemory();
            fileRecord.couple = user.couple;
            fileRecord.uploader = user;
            fileRecord.originalName = file.filename;
            fileRecord.mimeType = file.mimetype;
            fileRecord.size = buffer.length;
            fileRecord.isImage = isImage;
            if (album)
                fileRecord.album = album;
            if (this.googleDriveService.isReady()) {
                const uploadResult = await this.googleDriveService.uploadFile(file.filename, file.mimetype, buffer);
                fileRecord.storageDriver = 'google_drive';
                fileRecord.googleDriveFileId = uploadResult.fileId;
                fileRecord.filePath = `google-drive://${uploadResult.fileId}`;
                this.logger.log(`Google Drive에 파일 업로드 완료: ${file.filename} (${uploadResult.fileId})`);
            }
            else {
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
        }
        catch (error) {
            this.logger.error('파일 저장 중 오류 발생:', error);
            throw new common_1.InternalServerErrorException('파일 저장 중 오류가 발생했습니다.');
        }
    }
    async listFiles(user, query) {
        if (!user.couple)
            return [];
        const { type, sort = 'createdAt', order = 'DESC', albumId, favorite } = query;
        const queryBuilder = this.fileRepository
            .createQueryBuilder('file')
            .where('file.coupleId = :coupleId', { coupleId: user.couple.id })
            .andWhere('file.deletedAt IS NULL');
        if (type === 'image') {
            queryBuilder.andWhere('file.isImage = :isImage', { isImage: true });
        }
        else if (type === 'document') {
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
    async toggleFavorite(user, fileId) {
        const file = await this.fileRepository.findOne({
            where: { id: fileId },
            relations: ['couple'],
        });
        if (!file || file.deletedAt) {
            throw new common_1.NotFoundException('파일을 찾을 수 없습니다.');
        }
        if (file.couple.id !== user.couple?.id) {
            throw new common_1.ForbiddenException('권한이 없습니다.');
        }
        file.isFavorite = !file.isFavorite;
        return await this.fileRepository.save(file);
    }
    async moveToAlbum(user, fileId, albumId) {
        const file = await this.fileRepository.findOne({
            where: { id: fileId },
            relations: ['couple'],
        });
        if (!file || file.deletedAt)
            throw new common_1.NotFoundException('파일을 찾을 수 없습니다.');
        if (file.couple.id !== user.couple?.id) {
            throw new common_1.ForbiddenException('권한이 없습니다.');
        }
        if (!albumId) {
            file.album = null;
        }
        else {
            const album = await this.albumRepository.findOne({
                where: { id: albumId, couple: { id: user.couple?.id } },
            });
            if (!album)
                throw new common_1.NotFoundException('앨범을 찾을 수 없습니다.');
            file.album = album;
        }
        return await this.fileRepository.save(file);
    }
    async getFile(user, fileId) {
        const file = await this.fileRepository.findOne({
            where: { id: fileId },
            relations: ['couple'],
        });
        if (!file || file.deletedAt) {
            throw new common_1.NotFoundException('파일을 찾을 수 없습니다.');
        }
        if (file.couple.id !== user.couple?.id) {
            throw new common_1.ForbiddenException('해당 파일에 접근 권한이 없습니다.');
        }
        if (file.storageDriver === 'google_drive' || file.googleDriveFileId) {
            const fileId = file.googleDriveFileId || file.filePath.replace('google-drive://', '');
            try {
                const stream = await this.googleDriveService.getFileStream(fileId);
                return {
                    stream,
                    mimeType: file.mimeType,
                    fileName: file.originalName,
                };
            }
            catch (err) {
                this.logger.error(`구글 드라이브 파일 스트림 로드 실패 (${fileId}):`, err);
                throw new common_1.NotFoundException('구글 드라이브에서 파일을 불러올 수 없습니다.');
            }
        }
        if (!fs.existsSync(file.filePath)) {
            throw new common_1.NotFoundException('파일이 서버에서 소실되었습니다.');
        }
        return {
            stream: fs.createReadStream(file.filePath),
            mimeType: file.mimeType,
            fileName: file.originalName,
        };
    }
    async softDelete(user, fileId) {
        const file = await this.fileRepository.findOne({
            where: { id: fileId },
            relations: ['couple'],
        });
        if (!file) {
            throw new common_1.NotFoundException('파일을 찾을 수 없습니다.');
        }
        if (file.couple.id !== user.couple?.id) {
            throw new common_1.ForbiddenException('삭제 권한이 없습니다.');
        }
        await this.fileRepository.softDelete(fileId);
        return { success: true };
    }
};
exports.DriveService = DriveService;
exports.DriveService = DriveService = DriveService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(file_memory_entity_1.FileMemory)),
    __param(1, (0, typeorm_1.InjectRepository)(album_entity_1.Album)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        google_drive_service_1.GoogleDriveService])
], DriveService);
//# sourceMappingURL=drive.service.js.map