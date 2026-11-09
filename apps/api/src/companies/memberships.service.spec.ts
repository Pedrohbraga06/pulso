import { ConflictException, ForbiddenException } from '@nestjs/common';
import { CompanyRole } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CompanyMembershipContext } from './company-access.types.js';
import { MembershipsService } from './memberships.service.js';

describe('MembershipsService', () => {
  const transaction = {
    membership: {
      findFirst: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
  };
  const prismaMock = {
    membership: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(
      async <T>(callback: (tx: typeof transaction) => Promise<T>) =>
        callback(transaction),
    ),
  };
  let service: MembershipsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MembershipsService(prismaMock as unknown as PrismaService);
  });

  it('prevents removing the last OWNER', async () => {
    transaction.membership.findFirst.mockResolvedValue({
      id: 'owner-membership',
      role: CompanyRole.OWNER,
    });
    transaction.membership.count.mockResolvedValue(1);
    const actor: CompanyMembershipContext = {
      id: 'owner-membership',
      userId: 'owner-user',
      companyId: 'company',
      role: CompanyRole.OWNER,
    };

    await expect(
      service.removeMember('company', 'owner-membership', actor),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(transaction.membership.delete).not.toHaveBeenCalled();
  });

  it('prevents ADMIN from removing an OWNER', async () => {
    transaction.membership.findFirst.mockResolvedValue({
      id: 'owner-membership',
      role: CompanyRole.OWNER,
    });
    const actor: CompanyMembershipContext = {
      id: 'admin-membership',
      userId: 'admin-user',
      companyId: 'company',
      role: CompanyRole.ADMIN,
    };

    await expect(
      service.removeMember('company', 'owner-membership', actor),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(transaction.membership.delete).not.toHaveBeenCalled();
  });

  it('prevents a user from elevating their own role', async () => {
    transaction.membership.findFirst.mockResolvedValue({
      id: 'member-membership',
      userId: 'member-user',
      role: CompanyRole.MEMBER,
      createdAt: new Date(),
      companyId: 'company',
      company: { name: 'Company' },
      user: {
        id: 'member-user',
        email: 'member@example.test',
        name: 'Member',
      },
    });
    const actor: CompanyMembershipContext = {
      id: 'member-membership',
      userId: 'member-user',
      companyId: 'company',
      role: CompanyRole.MEMBER,
    };

    await expect(
      service.changeRole('company', 'member-membership', actor, {
        role: CompanyRole.ADMIN,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(transaction.membership.update).not.toHaveBeenCalled();
  });
});
