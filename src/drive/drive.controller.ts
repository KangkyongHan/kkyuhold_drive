import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DriveService } from './drive.service';
import type { FastifyReply } from 'fastify';

@Controller('drive')
@UseGuards(AuthGuard('jwt'))
export class DriveController {
  constructor(private readonly driveService: DriveService) {}

  @Post('upload')
  async upload(@Request() req: any, @Query('albumId') albumId?: string) {
    const file = await req.file();
    return this.driveService.uploadFile(req.user, file, albumId);
  }

  @Get('files')
  async list(@Request() req: any, @Query() query: any) {
    return this.driveService.listFiles(req.user, query);
  }

  @Patch('files/:id/favorite')
  async toggleFavorite(@Request() req: any, @Param('id') id: string) {
    return this.driveService.toggleFavorite(req.user, id);
  }

  @Patch('files/:id/move')
  async moveToAlbum(
    @Request() req: any,
    @Param('id') id: string,
    @Body('albumId') albumId: string,
  ) {
    return this.driveService.moveToAlbum(req.user, id, albumId);
  }

  @Get('files/:id/view')
  async view(
    @Request() req: any,
    @Param('id') id: string,
    @Res() res: FastifyReply,
  ) {
    const { stream, mimeType } = await this.driveService.getFile(req.user, id);
    res.type(mimeType).send(stream);
  }

  @Delete('files/:id')
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.driveService.softDelete(req.user, id);
  }
}
