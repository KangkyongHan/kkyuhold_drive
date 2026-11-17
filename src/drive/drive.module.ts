import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriveService } from './drive.service';
import { DriveController } from './drive.controller';
import { GoogleDriveService } from './google-drive.service';
import { FileMemory } from '../entities/file-memory.entity';
import { Album } from '../entities/album.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([FileMemory, Album]), AuthModule],
  providers: [DriveService, GoogleDriveService],
  controllers: [DriveController],
  exports: [DriveService, GoogleDriveService],
})
export class DriveModule {}
