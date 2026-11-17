import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller() // The global prefix /api is already set in main.ts
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(): string {
    return 'Couple Drive API is running! ❤️';
  }

  @Get('health')
  getHealth(): string {
    return this.appService.getHealth();
  }
}
