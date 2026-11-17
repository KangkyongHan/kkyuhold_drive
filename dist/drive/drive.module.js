"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriveModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const drive_service_1 = require("./drive.service");
const drive_controller_1 = require("./drive.controller");
const google_drive_service_1 = require("./google-drive.service");
const file_memory_entity_1 = require("../entities/file-memory.entity");
const album_entity_1 = require("../entities/album.entity");
const auth_module_1 = require("../auth/auth.module");
let DriveModule = class DriveModule {
};
exports.DriveModule = DriveModule;
exports.DriveModule = DriveModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([file_memory_entity_1.FileMemory, album_entity_1.Album]), auth_module_1.AuthModule],
        providers: [drive_service_1.DriveService, google_drive_service_1.GoogleDriveService],
        controllers: [drive_controller_1.DriveController],
        exports: [drive_service_1.DriveService, google_drive_service_1.GoogleDriveService],
    })
], DriveModule);
//# sourceMappingURL=drive.module.js.map