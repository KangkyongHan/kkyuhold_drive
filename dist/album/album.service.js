"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlbumService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const album_entity_1 = require("../entities/album.entity");
const file_memory_entity_1 = require("../entities/file-memory.entity");
let AlbumService = class AlbumService {
    albumRepository;
    fileRepository;
    constructor(albumRepository, fileRepository) {
        this.albumRepository = albumRepository;
        this.fileRepository = fileRepository;
    }
    async create(user, dto) {
        if (!user.couple) {
            throw new common_1.ForbiddenException('커플 연결 후 앨범 생성이 가능합니다.');
        }
        const album = this.albumRepository.create({
            name: dto.name,
            couple: user.couple,
        });
        return await this.albumRepository.save(album);
    }
    async findAll(user) {
        if (!user.couple)
            return { albums: [], totalFileCount: 0 };
        const [albums, totalFileCount] = await Promise.all([
            this.albumRepository
                .createQueryBuilder('album')
                .leftJoin('album.files', 'file')
                .select(['album.id', 'album.name', 'album.createdAt'])
                .addSelect('COUNT(file.id)', 'album_fileCount')
                .where('album.coupleId = :coupleId', { coupleId: user.couple.id })
                .groupBy('album.id')
                .orderBy('album.createdAt', 'DESC')
                .getRawAndEntities(),
            this.fileRepository.count({
                where: { couple: { id: user.couple.id } }
            }),
        ]);
        const albumsWithCounts = albums.entities.map((album, index) => ({
            ...album,
            fileCount: parseInt(albums.raw[index].album_fileCount, 10),
        }));
        return {
            albums: albumsWithCounts,
            totalFileCount,
        };
    }
    async findOne(user, id) {
        const album = await this.albumRepository.findOne({
            where: { id },
            relations: ['couple', 'files'],
        });
        if (!album || album.deletedAt) {
            throw new common_1.NotFoundException('앨범을 찾을 수 없습니다.');
        }
        if (album.couple.id !== user.couple?.id) {
            throw new common_1.ForbiddenException('해당 앨범에 접근 권한이 없습니다.');
        }
        return album;
    }
    async remove(user, id) {
        const album = await this.albumRepository.findOne({
            where: { id },
            relations: ['couple'],
        });
        if (!album) {
            throw new common_1.NotFoundException('앨범을 찾을 수 없습니다.');
        }
        if (album.couple.id !== user.couple?.id) {
            throw new common_1.ForbiddenException('삭제 권한이 없습니다.');
        }
        await this.albumRepository.softDelete(id);
        return { success: true };
    }
};
exports.AlbumService = AlbumService;
exports.AlbumService = AlbumService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(album_entity_1.Album)),
    __param(1, (0, typeorm_1.InjectRepository)(file_memory_entity_1.FileMemory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AlbumService);
//# sourceMappingURL=album.service.js.map