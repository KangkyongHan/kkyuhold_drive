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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Album = void 0;
const typeorm_1 = require("typeorm");
const couple_entity_1 = require("./couple.entity");
const file_memory_entity_1 = require("./file-memory.entity");
let Album = class Album {
    id;
    name;
    startDate;
    endDate;
    location;
    latitude;
    longitude;
    coverFileId;
    couple;
    createdAt;
    updatedAt;
    deletedAt;
    files;
};
exports.Album = Album;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Album.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Album.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Album.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Album.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Album.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Object)
], Album.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Object)
], Album.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Album.prototype, "coverFileId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => couple_entity_1.Couple),
    __metadata("design:type", couple_entity_1.Couple)
], Album.prototype, "couple", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Album.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Album.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], Album.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => file_memory_entity_1.FileMemory, (file) => file.album),
    __metadata("design:type", Array)
], Album.prototype, "files", void 0);
exports.Album = Album = __decorate([
    (0, typeorm_1.Entity)('albums')
], Album);
//# sourceMappingURL=album.entity.js.map