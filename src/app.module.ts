import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Couple } from './entities/couple.entity';
import { FileMemory } from './entities/file-memory.entity';
import { Album } from './entities/album.entity';
import { AuthModule } from './auth/auth.module';
import { DriveModule } from './drive/drive.module';
import { AlbumModule } from './album/album.module';
import { SecurityModule } from './security/security.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SecurityModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [User, Couple, FileMemory, Album],
            synchronize: true, // 자동 테이블 생성/업데이트
            ssl: {
              rejectUnauthorized: false,
            },
          };
        }
        return {
          type: 'sqlite',
          database: configService.get<string>('DB_DATABASE', 'data/database.sqlite'),
          entities: [User, Couple, FileMemory, Album],
          synchronize: true,
        };
      },
    }),
    AuthModule,
    DriveModule,
    AlbumModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
