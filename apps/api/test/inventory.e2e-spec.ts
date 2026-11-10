import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Inventory (e2e)', () => {
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
            some: { user: { email: { in: testEmails } } },
          },
        },
      });
      await prisma.user.deleteMany({ where: { email: { in: testEmails } } });
      testEmails.length = 0;
    }

    await app.close();
  });

  it('scopes items to company membership and enforces stock permissions and limits', async () => {
    const owner = await registerUser('owner');
    const member = await registerUser('member');
    const outsider = await registerUser('outsider');
    await prisma.membership.create({
      data: {
        userId: member.userId,
        companyId: owner.companyId,
        role: 'MEMBER',
      },
    });

    await request(app.getHttpServer())
      .get(`/companies/${owner.companyId}/inventory-items`)
      .set('Authorization', `Bearer ${outsider.accessToken}`)
      .expect(404);

    await request(app.getHttpServer())
      .post(`/companies/${owner.companyId}/inventory-items`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send({ name: 'Arroz', unit: 'kg', minimumQuantity: '2' })
      .expect(403);

    await request(app.getHttpServer())
      .post(`/companies/${owner.companyId}/inventory-items`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({
        name: 'Invalid tenant item',
        unit: 'kg',
        minimumQuantity: '2',
        companyId: owner.companyId,
      })
      .expect(400);

    await request(app.getHttpServer())
      .post(`/companies/${owner.companyId}/inventory-items`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ name: 'Invalid precision', unit: 'kg', minimumQuantity: '2.0001' })
      .expect(400);

    const item = await request(app.getHttpServer())
      .post(`/companies/${owner.companyId}/inventory-items`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ name: 'Farinha', unit: 'kg', minimumQuantity: '5' })
      .expect(201);
    expect(item.body).toMatchObject({
      companyId: owner.companyId,
      quantityOnHand: '0',
      minimumQuantity: '5',
      status: 'BELOW_MINIMUM',
      isActive: true,
    });

    const memberItems = await request(app.getHttpServer())
      .get(`/companies/${owner.companyId}/inventory-items`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .expect(200);
    expect(memberItems.body).toHaveLength(1);

    await request(app.getHttpServer())
      .post(
        `/companies/${owner.companyId}/inventory-items/${item.body.id}/movements`,
      )
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send({ type: 'ENTRY', quantity: '10.001', reason: 'Recebimento' })
      .expect(201);

    const concurrentExits = await Promise.all([
      request(app.getHttpServer())
        .post(
          `/companies/${owner.companyId}/inventory-items/${item.body.id}/movements`,
        )
        .set('Authorization', `Bearer ${member.accessToken}`)
        .send({ type: 'EXIT', quantity: '7', reason: 'Uso na cozinha' }),
      request(app.getHttpServer())
        .post(
          `/companies/${owner.companyId}/inventory-items/${item.body.id}/movements`,
        )
        .set('Authorization', `Bearer ${member.accessToken}`)
        .send({ type: 'EXIT', quantity: '7', reason: 'Uso na cozinha' }),
    ]);
    expect(concurrentExits.map((response) => response.status).sort()).toEqual([
      201, 409,
    ]);

    const memberAdjustment = await request(app.getHttpServer())
      .post(
        `/companies/${owner.companyId}/inventory-items/${item.body.id}/movements`,
      )
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send({
        type: 'ADJUSTMENT',
        countedQuantity: '5',
        reason: 'Contagem física',
      })
      .expect(403);
    expect(memberAdjustment.body.message).toBe(
      'Only an OWNER or ADMIN can adjust stock',
    );

    const adjustment = await request(app.getHttpServer())
      .post(
        `/companies/${owner.companyId}/inventory-items/${item.body.id}/movements`,
      )
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({
        type: 'ADJUSTMENT',
        countedQuantity: '5',
        reason: 'Contagem física',
      })
      .expect(201);
    expect(adjustment.body).toMatchObject({
      type: 'ADJUSTMENT',
      quantity: '1.999',
      countedQuantity: '5',
      delta: '1.999',
      beforeQuantity: '3.001',
      afterQuantity: '5',
      actorName: 'owner user',
    });

    await request(app.getHttpServer())
      .post(
        `/companies/${owner.companyId}/inventory-items/${item.body.id}/movements`,
      )
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send({ type: 'EXIT', quantity: '5.001', reason: 'Saída excessiva' })
      .expect(409);

    const updated = await request(app.getHttpServer())
      .patch(`/companies/${owner.companyId}/inventory-items/${item.body.id}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ minimumQuantity: '5' })
      .expect(200);
    expect(updated.body.status).toBe('AT_MINIMUM');

    await request(app.getHttpServer())
      .patch(`/companies/${owner.companyId}/inventory-items/${item.body.id}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ isActive: false })
      .expect(200)
      .expect(({ body }) => {
        expect(body.isActive).toBe(false);
      });

    await request(app.getHttpServer())
      .post(
        `/companies/${owner.companyId}/inventory-items/${item.body.id}/movements`,
      )
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send({ type: 'ENTRY', quantity: '1', reason: 'Após arquivo' })
      .expect(409);

    const history = await request(app.getHttpServer())
      .get(`/companies/${owner.companyId}/inventory-movements`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .expect(200);
    expect(history.body).toHaveLength(3);
    expect(history.body[0].reason).toBe('Contagem física');
  });

  it('does not expose another company’s stock by item id or movement list', async () => {
    const owner = await registerUser('owner');
    const outsider = await registerUser('outsider');
    const item = await request(app.getHttpServer())
      .post(`/companies/${owner.companyId}/inventory-items`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ name: 'Café', unit: 'kg', minimumQuantity: '1' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/companies/${owner.companyId}/inventory-items/${item.body.id}`)
      .set('Authorization', `Bearer ${outsider.accessToken}`)
      .send({ minimumQuantity: '2' })
      .expect(404);

    await request(app.getHttpServer())
      .get(`/companies/${owner.companyId}/inventory-movements`)
      .set('Authorization', `Bearer ${outsider.accessToken}`)
      .expect(404);
  });

  async function registerUser(label: string): Promise<{
    accessToken: string;
    companyId: string;
    userId: string;
  }> {
    const email = `${label}-${randomUUID()}@example.test`;
    testEmails.push(email);
    const registration = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: `${label} user`,
        email,
        password: 'correct-horse-battery-42',
        companyName: `${label} company`,
      })
      .expect(201);

    return {
      accessToken: registration.body.accessToken,
      companyId: registration.body.memberships[0].companyId,
      userId: registration.body.user.id,
    };
  }
});
