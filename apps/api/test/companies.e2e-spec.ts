import { createHash, randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Memberships and invitations (e2e)', () => {
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
              user: { email: { in: testEmails } },
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

  it('lets an OWNER invite and an authenticated user accept once', async () => {
    const owner = await registerUser('owner');
    const inviteeEmail = uniqueEmail('invitee');
    const invitation = await request(app.getHttpServer())
      .post(`/companies/${owner.companyId}/invitations`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ email: inviteeEmail, role: 'MEMBER' })
      .expect(201);

    expect(invitation.body.token).toMatch(/^[a-f0-9]{64}$/);
    const storedInvitation = await prisma.companyInvitation.findUniqueOrThrow({
      where: { id: invitation.body.id },
    });
    expect(storedInvitation.tokenHash).not.toBe(invitation.body.token);
    expect(storedInvitation.tokenHash).toBe(
      createHash('sha256').update(invitation.body.token).digest('hex'),
    );
    expect(storedInvitation.expiresAt.getTime()).toBeGreaterThan(Date.now());

    const invitee = await registerUser('invitee', inviteeEmail);
    const accepted = await request(app.getHttpServer())
      .post('/invitations/accept')
      .set('Authorization', `Bearer ${invitee.accessToken}`)
      .send({ token: invitation.body.token })
      .expect(201);

    expect(accepted.body).toMatchObject({
      companyId: owner.companyId,
      role: 'MEMBER',
    });
    const memberships = await request(app.getHttpServer())
      .get('/companies')
      .set('Authorization', `Bearer ${invitee.accessToken}`)
      .expect(200);
    expect(
      memberships.body.map(
        (membership: { companyId: string }) => membership.companyId,
      ),
    ).toContain(owner.companyId);

    await request(app.getHttpServer())
      .post('/invitations/accept')
      .set('Authorization', `Bearer ${invitee.accessToken}`)
      .send({ token: invitation.body.token })
      .expect(400);
  });

  it('rejects invalid, expired, revoked, and email-mismatched invitations', async () => {
    const owner = await registerUser('owner');
    const user = await registerUser('invitee');

    await request(app.getHttpServer())
      .post('/invitations/accept')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ token: '0'.repeat(64) })
      .expect(400);

    const expired = await createInvitation(owner, user.email);
    await prisma.companyInvitation.update({
      where: { id: expired.body.id },
      data: { expiresAt: new Date(Date.now() - 1_000) },
    });
    await request(app.getHttpServer())
      .post('/invitations/accept')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ token: expired.body.token })
      .expect(400);

    const revoked = await createInvitation(owner, user.email);
    await request(app.getHttpServer())
      .delete(`/companies/${owner.companyId}/invitations/${revoked.body.id}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .post('/invitations/accept')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ token: revoked.body.token })
      .expect(400);

    const mismatched = await createInvitation(owner, 'different@example.test');
    await request(app.getHttpServer())
      .post('/invitations/accept')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ token: mismatched.body.token })
      .expect(403);
  });

  it('blocks MEMBER management, duplicate memberships, and non-member access', async () => {
    const owner = await registerUser('owner');
    const member = await registerUser('member');
    const outsider = await registerUser('outsider');

    const added = await request(app.getHttpServer())
      .post(`/companies/${owner.companyId}/members`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ userId: member.userId })
      .expect(201);
    expect(added.body.role).toBe('MEMBER');

    await request(app.getHttpServer())
      .post(`/companies/${owner.companyId}/members`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ userId: member.userId })
      .expect(409);

    const duplicateInvitation = await createInvitation(owner, member.email);
    await request(app.getHttpServer())
      .post('/invitations/accept')
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send({ token: duplicateInvitation.body.token })
      .expect(409);
    const unclaimedInvitation =
      await prisma.companyInvitation.findUniqueOrThrow({
        where: { id: duplicateInvitation.body.id },
      });
    expect(unclaimedInvitation.acceptedAt).toBeNull();

    await request(app.getHttpServer())
      .post(`/companies/${owner.companyId}/members`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send({ userId: outsider.userId, role: 'OWNER' })
      .expect(403);
    await request(app.getHttpServer())
      .post(`/companies/${owner.companyId}/invitations`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send({ email: outsider.email })
      .expect(403);
    await request(app.getHttpServer())
      .get(`/companies/${owner.companyId}/members`)
      .set('Authorization', `Bearer ${outsider.accessToken}`)
      .expect(404);
    await request(app.getHttpServer())
      .get(`/companies/${owner.companyId}/members`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .get(`/companies/${owner.companyId}/members/${added.body.id}`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.userId).toBe(member.userId);
      });
  });

  it('preserves an OWNER and prevents unauthorized role changes', async () => {
    const owner = await registerUser('owner');
    const member = await registerUser('member');
    const outsider = await registerUser('outsider');
    const ownerMembership = await prisma.membership.findUniqueOrThrow({
      where: {
        userId_companyId: {
          userId: owner.userId,
          companyId: owner.companyId,
        },
      },
    });

    await request(app.getHttpServer())
      .delete(`/companies/${owner.companyId}/members/${ownerMembership.id}`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(409);
    await request(app.getHttpServer())
      .patch(`/companies/${owner.companyId}/members/${ownerMembership.id}/role`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ role: 'ADMIN' })
      .expect(403);

    const added = await request(app.getHttpServer())
      .post(`/companies/${owner.companyId}/members`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ userId: member.userId, role: 'MEMBER' })
      .expect(201);
    await request(app.getHttpServer())
      .patch(`/companies/${owner.companyId}/members/${added.body.id}/role`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ role: 'ADMIN' })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/companies/${owner.companyId}/members`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send({ userId: outsider.userId })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/companies/${owner.companyId}/members`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send({ userId: outsider.userId, role: 'OWNER' })
      .expect(403);
    await request(app.getHttpServer())
      .post(`/companies/${owner.companyId}/invitations`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send({ email: uniqueEmail('owner-invite'), role: 'OWNER' })
      .expect(403);
    await request(app.getHttpServer())
      .post(`/companies/${owner.companyId}/invitations`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send({ email: uniqueEmail('member-invite'), role: 'MEMBER' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/companies/${owner.companyId}/members/${added.body.id}/role`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .send({ role: 'OWNER' })
      .expect(403);
    await request(app.getHttpServer())
      .delete(`/companies/${owner.companyId}/members/${ownerMembership.id}`)
      .set('Authorization', `Bearer ${member.accessToken}`)
      .expect(403);
  });

  async function registerUser(
    label: string,
    email = uniqueEmail(label),
  ): Promise<{
    accessToken: string;
    companyId: string;
    email: string;
    userId: string;
  }> {
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
      email,
      userId: registration.body.user.id,
    };
  }

  async function createInvitation(
    owner: Awaited<ReturnType<typeof registerUser>>,
    email: string,
  ) {
    return request(app.getHttpServer())
      .post(`/companies/${owner.companyId}/invitations`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ email, role: 'MEMBER' })
      .expect(201);
  }

  function uniqueEmail(label: string): string {
    return `${label}-${randomUUID()}@example.test`;
  }
});
