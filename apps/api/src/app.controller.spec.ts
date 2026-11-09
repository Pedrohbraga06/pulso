import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: HealthCheckService,
          useValue: {
            check: vi.fn().mockResolvedValue({ status: 'ok' }),
          },
        },
        {
          provide: PrismaHealthIndicator,
          useValue: {
            pingCheck: vi.fn().mockReturnValue({ status: 'up' }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            $connect: vi.fn(),
            $disconnect: vi.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the API status message', () => {
      expect(appController.getHello()).toBe('PULSO API is running.');
    });
  });
});
