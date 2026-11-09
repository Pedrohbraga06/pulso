import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CompanyRole, Prisma } from '@prisma/client';
import type {
  CompanyMemberDetails,
  CompanyMembershipSummary,
} from '@pulso/contracts';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CompanyMembershipContext } from './company-access.types.js';
import type { AddMemberDto } from './dto/add-member.dto.js';
import type { ChangeMembershipRoleDto } from './dto/change-membership-role.dto.js';

@Injectable()
export class MembershipsService {
  constructor(private readonly prisma: PrismaService) {}

  async listMyCompanies(userId: string): Promise<CompanyMembershipSummary[]> {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: { company: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((membership) => ({
      id: membership.id,
      companyId: membership.companyId,
      companyName: membership.company.name,
      role: membership.role,
      createdAt: membership.createdAt.toISOString(),
    }));
  }

  async listMembers(companyId: string): Promise<CompanyMemberDetails[]> {
    const memberships = await this.prisma.membership.findMany({
      where: { companyId },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((membership) => this.toMemberDetails(membership));
  }

  async getMember(
    companyId: string,
    membershipId: string,
  ): Promise<CompanyMemberDetails> {
    const membership = await this.prisma.membership.findFirst({
      where: { id: membershipId, companyId },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    return this.toMemberDetails(membership);
  }

  async addMember(
    companyId: string,
    actor: CompanyMembershipContext,
    input: AddMemberDto,
  ): Promise<CompanyMemberDetails> {
    if (
      input.userId === actor.userId &&
      (input.role === CompanyRole.OWNER || input.role === CompanyRole.ADMIN) &&
      input.role !== actor.role
    ) {
      throw new ForbiddenException('You cannot elevate your own company role');
    }

    if (input.role === CompanyRole.OWNER && actor.role !== CompanyRole.OWNER) {
      throw new ForbiddenException('Only an OWNER can grant the OWNER role');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      const membership = await this.prisma.membership.create({
        data: {
          userId: user.id,
          companyId,
          role: input.role,
        },
        include: {
          user: { select: { id: true, email: true, name: true } },
        },
      });

      return this.toMemberDetails(membership);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('User is already a member of this company');
      }

      throw error;
    }
  }

  async removeMember(
    companyId: string,
    membershipId: string,
    actor: CompanyMembershipContext,
  ): Promise<void> {
    try {
      await this.prisma.$transaction(
        async (transaction) => {
          const membership = await transaction.membership.findFirst({
            where: { id: membershipId, companyId },
            select: { id: true, role: true },
          });

          if (!membership) {
            throw new NotFoundException('Membership not found');
          }

          if (membership.role === CompanyRole.OWNER) {
            if (actor.role !== CompanyRole.OWNER) {
              throw new ForbiddenException('Only an OWNER can remove an OWNER');
            }

            const ownerCount = await transaction.membership.count({
              where: { companyId, role: CompanyRole.OWNER },
            });
            if (ownerCount <= 1) {
              throw new ConflictException(
                'A company must retain at least one OWNER',
              );
            }
          }

          await transaction.membership.delete({
            where: { id: membership.id },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      this.throwForOwnerRace(error);
      throw error;
    }
  }

  async changeRole(
    companyId: string,
    membershipId: string,
    actor: CompanyMembershipContext,
    input: ChangeMembershipRoleDto,
  ): Promise<CompanyMemberDetails> {
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const membership = await transaction.membership.findFirst({
            where: { id: membershipId, companyId },
            include: {
              user: { select: { id: true, email: true, name: true } },
            },
          });

          if (!membership) {
            throw new NotFoundException('Membership not found');
          }

          if (
            membership.userId === actor.userId &&
            (input.role === CompanyRole.OWNER ||
              input.role === CompanyRole.ADMIN) &&
            input.role !== membership.role
          ) {
            throw new ForbiddenException(
              'You cannot elevate your own company role',
            );
          }

          if (
            actor.role !== CompanyRole.OWNER &&
            (membership.role === CompanyRole.OWNER ||
              input.role === CompanyRole.OWNER)
          ) {
            throw new ForbiddenException(
              'Only an OWNER can manage the OWNER role',
            );
          }

          if (
            membership.role === CompanyRole.OWNER &&
            input.role !== CompanyRole.OWNER
          ) {
            const ownerCount = await transaction.membership.count({
              where: { companyId, role: CompanyRole.OWNER },
            });
            if (ownerCount <= 1) {
              throw new ConflictException(
                'A company must retain at least one OWNER',
              );
            }
          }

          if (input.role === membership.role) {
            return this.toMemberDetails(membership);
          }

          const updated = await transaction.membership.update({
            where: { id: membership.id },
            data: { role: input.role },
            include: {
              user: { select: { id: true, email: true, name: true } },
            },
          });

          return this.toMemberDetails(updated);
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      this.throwForOwnerRace(error);
      throw error;
    }
  }

  private toMemberDetails(
    membership: Prisma.MembershipGetPayload<{
      include: { user: { select: { id: true; email: true; name: true } } };
    }>,
  ): CompanyMemberDetails {
    return {
      id: membership.id,
      companyId: membership.companyId,
      userId: membership.user.id,
      email: membership.user.email,
      name: membership.user.name,
      role: membership.role,
      createdAt: membership.createdAt.toISOString(),
    };
  }

  private throwForOwnerRace(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2034'
    ) {
      throw new ConflictException(
        'Concurrent membership change; retry the operation',
      );
    }
  }
}
