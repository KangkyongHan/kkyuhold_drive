import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AlbumService } from './album.service';
import { CreateAlbumDto } from './dto/create-album.dto';

@Controller('albums')
@UseGuards(AuthGuard('jwt'))
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Post()
  create(@Request() req: any, @Body() createAlbumDto: CreateAlbumDto) {
    return this.albumService.create(req.user, createAlbumDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.albumService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.albumService.findOne(req.user, id);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.albumService.remove(req.user, id);
  }
}
