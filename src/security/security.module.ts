import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 30, // Increased from 3
      },
      {
        name: 'medium',
        ttl: 60000,
        limit: 150, // Increased from 20
      },
      {
        name: 'login',
        ttl: 60000,
        limit: 50, // Increased from 10
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class SecurityModule {}
