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
exports.DriveController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const drive_service_1 = require("./drive.service");
let DriveController = class DriveController {
    driveService;
    constructor(driveService) {
        this.driveService = driveService;
    }
    async upload(req, albumId) {
        const file = await req.file();
        return this.driveService.uploadFile(req.user, file, albumId);
    }
    async list(req, query) {
        return this.driveService.listFiles(req.user, query);
    }
    async toggleFavorite(req, id) {
        return this.driveService.toggleFavorite(req.user, id);
    }
    async moveToAlbum(req, id, albumId) {
        return this.driveService.moveToAlbum(req.user, id, albumId);
    }
    async view(req, id, res) {
        const { stream, mimeType } = await this.driveService.getFile(req.user, id);
        res.type(mimeType).send(stream);
    }
    async delete(req, id) {
        return this.driveService.softDelete(req.user, id);
    }
};
exports.DriveController = DriveController;
__decorate([
    (0, common_1.Post)('upload'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('albumId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DriveController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)('files'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DriveController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)('files/:id/favorite'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DriveController.prototype, "toggleFavorite", null);
__decorate([
    (0, common_1.Patch)('files/:id/move'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('albumId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], DriveController.prototype, "moveToAlbum", null);
__decorate([
    (0, common_1.Get)('files/:id/view'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], DriveController.prototype, "view", null);
__decorate([
    (0, common_1.Delete)('files/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DriveController.prototype, "delete", null);
exports.DriveController = DriveController = __decorate([
    (0, common_1.Controller)('drive'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [drive_service_1.DriveService])
], DriveController);
//# sourceMappingURL=drive.controller.js.map