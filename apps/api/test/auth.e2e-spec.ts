import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { randomUUID } from 'node:crypto';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Authentication (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const testEmails: string[] = [];

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterEach(async () => {
    if (testEmails.length > 0) {
      await prisma.company.deleteMany({
        where: {
          memberships: {
            some: {
              user: {
                email: { in: testEmails },
              },
            },
          },
        },
      });
      await prisma.user.deleteMany({
        where: { email: { in: testEmails } },
      });
      testEmails.length = 0;
    }

    await app.close();
  });

  it('registers a user and company, then authenticates the protected profile', async () => {
    const email = `auth-${randomUUID()}@example.test`;
    const password = 'correct-horse-battery-42';
    testEmails.push(email);

    const registration = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Test Owner',
        email: email.toUpperCase(),
        password,
        companyName: 'Test Company',
      })
      .expect(201);
    expect(registration.body.user.email).toBe(email);
    expect(registration.body.user.passwordHash).toBeUndefined();
    expect(registration.body.tokenType).toBe('Bearer');
    expect(registration.body.expiresIn).toBe(900);
    expect(registration.body.memberships).toHaveLength(1);
    expect(registration.body.memberships[0].role).toBe('OWNER');

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    const profile = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(200);

    expect(profile.body.user).toEqual(registration.body.user);
    expect(profile.body.memberships).toEqual(registration.body.memberships);
  });

  it('rejects invalid credentials, unauthenticated access, and client tenant ids', async () => {
    const email = `auth-${randomUUID()}@example.test`;
    const password = 'correct-horse-battery-42';
    testEmails.push(email);

    const registration = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Test Owner',
        email,
        password,
        companyName: 'Tenant Boundary Test',
      })
      .expect(201);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(401);

    await request(app.getHttpServer()).get('/auth/me').expect(401);

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Invalid Tenant',
        email: `other-${randomUUID()}@example.test`,
        password,
        companyName: 'Untrusted Tenant',
        tenantId: registration.body.memberships[0].companyId,
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Duplicate User',
        email,
        password,
        companyName: 'Another Company',
      })
      .expect(409);
  });
});
