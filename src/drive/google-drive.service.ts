import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';

@Injectable()
export class GoogleDriveService {
  private readonly logger = new Logger(GoogleDriveService.name);
  private driveClient: drive_v3.Drive | null = null;
  private folderIdCache: string | null = null;
  private isConfigured: boolean = false;

  constructor(private readonly configService: ConfigService) {
    this.initClient();
  }

  private initClient() {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const refreshToken = this.configService.get<string>('GOOGLE_REFRESH_TOKEN');

    if (!clientId || !clientSecret || !refreshToken) {
      this.logger.warn(
        'Google Drive API 환경변수가 설정되지 않았습니다. (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN). 로컬 저장소 모드로 작동합니다.',
      );
      this.isConfigured = false;
      return;
    }

    try {
      const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        'http://localhost:3000/oauth2callback',
      );

      oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      this.driveClient = google.drive({ version: 'v3', auth: oauth2Client });
      this.isConfigured = true;
      this.logger.log('Google Drive API 클라이언트가 성공적으로 초기화되었습니다.');
    } catch (error) {
      this.logger.error('Google Drive 클라이언트 초기화 실패:', error);
      this.isConfigured = false;
    }
  }

  public isReady(): boolean {
    return this.isConfigured && this.driveClient !== null;
  }

  /**
   * Couple Drive 전용 루트 폴더를 조회하거나 없으면 생성합니다.
   */
  async getOrCreateFolder(folderName: string = 'Couple_Drive'): Promise<string> {
    if (this.folderIdCache) return this.folderIdCache;
    if (!this.driveClient) throw new Error('Google Drive 클라이언트가 초기화되지 않았습니다.');

    try {
      const response = await this.driveClient.files.list({
        q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id, name)',
        spaces: 'drive',
      });

      if (response.data.files && response.data.files.length > 0) {
        this.folderIdCache = response.data.files[0].id!;
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

      this.folderIdCache = folder.data.id!;
      return this.folderIdCache;
    } catch (error) {
      this.logger.error(`구글 드라이브 폴더(${folderName}) 조회/생성 실패:`, error);
      throw error;
    }
  }

  /**
   * 파일을 구글 드라이브에 업로드합니다.
   */
  async uploadFile(
    fileName: string,
    mimeType: string,
    buffer: Buffer,
    parentFolderName: string = 'Couple_Drive',
  ): Promise<{ fileId: string; webViewLink?: string }> {
    if (!this.driveClient) throw new Error('Google Drive 클라이언트가 초기화되지 않았습니다.');

    const folderId = await this.getOrCreateFolder(parentFolderName);

    const stream = new Readable();
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
      fileId: response.data.id!,
      webViewLink: response.data.webViewLink || undefined,
    };
  }

  /**
   * 구글 드라이브 파일의 읽기 스트림을 가져옵니다.
   */
  async getFileStream(fileId: string): Promise<Readable> {
    if (!this.driveClient) throw new Error('Google Drive 클라이언트가 초기화되지 않았습니다.');

    const response = await this.driveClient.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' },
    );

    return response.data as unknown as Readable;
  }

  /**
   * 구글 드라이브 파일을 휴지통으로 이동하거나 삭제합니다.
   */
  async deleteFile(fileId: string): Promise<void> {
    if (!this.driveClient) return;
    try {
      await this.driveClient.files.delete({ fileId });
    } catch (error) {
      this.logger.error(`구글 드라이브 파일 삭제 실패 (${fileId}):`, error);
    }
  }
}

