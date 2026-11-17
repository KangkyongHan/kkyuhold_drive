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
var GoogleDriveService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleDriveService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const googleapis_1 = require("googleapis");
const stream_1 = require("stream");
let GoogleDriveService = GoogleDriveService_1 = class GoogleDriveService {
    configService;
    logger = new common_1.Logger(GoogleDriveService_1.name);
    driveClient = null;
    folderIdCache = null;
    isConfigured = false;
    constructor(configService) {
        this.configService = configService;
        this.initClient();
    }
    initClient() {
        const clientId = this.configService.get('GOOGLE_CLIENT_ID');
        const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
        const refreshToken = this.configService.get('GOOGLE_REFRESH_TOKEN');
        if (!clientId || !clientSecret || !refreshToken) {
            this.logger.warn('Google Drive API 환경변수가 설정되지 않았습니다. (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN). 로컬 저장소 모드로 작동합니다.');
            this.isConfigured = false;
            return;
        }
        try {
            const oauth2Client = new googleapis_1.google.auth.OAuth2(clientId, clientSecret, 'http://localhost:3000/oauth2callback');
            oauth2Client.setCredentials({
                refresh_token: refreshToken,
            });
            this.driveClient = googleapis_1.google.drive({ version: 'v3', auth: oauth2Client });
            this.isConfigured = true;
            this.logger.log('Google Drive API 클라이언트가 성공적으로 초기화되었습니다.');
        }
        catch (error) {
            this.logger.error('Google Drive 클라이언트 초기화 실패:', error);
            this.isConfigured = false;
        }
    }
    isReady() {
        return this.isConfigured && this.driveClient !== null;
    }
    async getOrCreateFolder(folderName = 'Couple_Drive') {
        if (this.folderIdCache)
            return this.folderIdCache;
        if (!this.driveClient)
            throw new Error('Google Drive 클라이언트가 초기화되지 않았습니다.');
        try {
            const response = await this.driveClient.files.list({
                q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
                fields: 'files(id, name)',
                spaces: 'drive',
            });
            if (response.data.files && response.data.files.length > 0) {
                this.folderIdCache = response.data.files[0].id;
                return this.folderIdCache;
            }
            const fileMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
            };
            const folder = await this.driveClient.files.create({
                requestBody: fileMetadata,
                fields: 'id',
            });
            this.folderIdCache = folder.data.id;
            return this.folderIdCache;
        }
        catch (error) {
            this.logger.error(`구글 드라이브 폴더(${folderName}) 조회/생성 실패:`, error);
            throw error;
        }
    }
    async uploadFile(fileName, mimeType, buffer, parentFolderName = 'Couple_Drive') {
        if (!this.driveClient)
            throw new Error('Google Drive 클라이언트가 초기화되지 않았습니다.');
        const folderId = await this.getOrCreateFolder(parentFolderName);
        const stream = new stream_1.Readable();
        stream.push(buffer);
        stream.push(null);
        const fileMetadata = {
            name: fileName,
            parents: [folderId],
        };
        const media = {
            mimeType,
            body: stream,
        };
        const response = await this.driveClient.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink, webContentLink',
        });
        return {
            fileId: response.data.id,
            webViewLink: response.data.webViewLink || undefined,
        };
    }
    async getFileStream(fileId) {
        if (!this.driveClient)
            throw new Error('Google Drive 클라이언트가 초기화되지 않았습니다.');
        const response = await this.driveClient.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
        return response.data;
    }
    async deleteFile(fileId) {
        if (!this.driveClient)
            return;
        try {
            await this.driveClient.files.delete({ fileId });
        }
        catch (error) {
            this.logger.error(`구글 드라이브 파일 삭제 실패 (${fileId}):`, error);
        }
    }
};
exports.GoogleDriveService = GoogleDriveService;
exports.GoogleDriveService = GoogleDriveService = GoogleDriveService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GoogleDriveService);
//# sourceMappingURL=google-drive.service.js.map