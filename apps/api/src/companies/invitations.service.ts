import { createHash, randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CompanyRole, Prisma } from '@prisma/client';
import type {
  AcceptedCompanyInvitation,
  CompanyInvitationSummary,
  CreatedCompanyInvitation,
} from '@pulso/contracts';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CompanyMembershipContext } from './company-access.types.js';
import type { AcceptInvitationDto } from './dto/accept-invitation.dto.js';
import type { CreateInvitationDto } from './dto/create-invitation.dto.js';

const INVITATION_TTL_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class InvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    companyId: string,
    actor: CompanyMembershipContext,
    input: CreateInvitationDto,
  ): Promise<CreatedCompanyInvitation> {
    if (input.role === CompanyRole.OWNER && actor.role !== CompanyRole.OWNER) {
      throw new ForbiddenException('Only an OWNER can invite another OWNER');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + INVITATION_TTL_MILLISECONDS);
    const invitation = await this.prisma.companyInvitation.create({
      data: {
        companyId,
        createdByUserId: actor.userId,
        email: input.email,
        role: input.role,
        tokenHash: this.hashToken(token),
        expiresAt,
      },
    });

    return {
      ...this.toSummary(invitation),
      token,
    };
  }

  async list(companyId: string): Promise<CompanyInvitationSummary[]> {
    const invitations = await this.prisma.companyInvitation.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        companyId: true,
        email: true,
        role: true,
        expiresAt: true,
        revokedAt: true,
        acceptedAt: true,
        createdAt: true,
      },
    });

    return invitations.map((invitation) => this.toSummary(invitation));
  }

  async revoke(companyId: string, invitationId: string): Promise<void> {
    const result = await this.prisma.companyInvitation.updateMany({
      where: {
        id: invitationId,
        companyId,
        revokedAt: null,
        acceptedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    if (result.count === 1) {
      return;
    }

    const invitation = await this.prisma.companyInvitation.findFirst({
      where: { id: invitationId, companyId },
      select: { id: true },
    });
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    throw new ConflictException('Invitation is already revoked or accepted');
  }

  async accept(
    userId: string,
    input: AcceptInvitationDto,
  ): Promise<AcceptedCompanyInvitation> {
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const invitation = await transaction.companyInvitation.findUnique({
            where: { tokenHash: this.hashToken(input.token) },
          });
          if (!invitation) {
            throw new BadRequestException('Invalid invitation token');
          }

          const now = new Date();
          if (
            invitation.revokedAt ||
            invitation.acceptedAt ||
            invitation.expiresAt <= now
          ) {
            throw new BadRequestException(
              'Invitation is expired, revoked, or already used',
            );
          }

          const user = await transaction.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true },
          });
          if (!user) {
            throw new UnauthorizedException('User account no longer exists');
          }

          if (
            invitation.email &&
            invitation.email.toLowerCase() !== user.email.toLowerCase()
          ) {
            throw new ForbiddenException(
              'Invitation email does not match the authenticated user',
            );
          }

          const claim = await transaction.companyInvitation.updateMany({
            where: {
              id: invitation.id,
              revokedAt: null,
              acceptedAt: null,
              expiresAt: { gt: now },
            },
            data: { acceptedAt: now },
          });
          if (claim.count !== 1) {
            throw new BadRequestException(
              'Invitation is expired, revoked, or already used',
            );
          }

          const membership = await transaction.membership.create({
            data: {
              userId: user.id,
              companyId: invitation.companyId,
              role: invitation.role,
            },
            include: { company: { select: { name: true } } },
          });

          return {
            companyId: membership.companyId,
            companyName: membership.company.name,
            role: membership.role,
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('User is already a member of this company');
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034'
      ) {
        throw new ConflictException(
          'Concurrent invitation acceptance; retry the operation',
        );
      }

      throw error;
    }
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private toSummary(invitation: {
    id: string;
    companyId: string;
    email: string | null;
    role: CompanyRole;
    expiresAt: Date;
    revokedAt: Date | null;
    acceptedAt: Date | null;
    createdAt: Date;
  }): CompanyInvitationSummary {
    return {
      id: invitation.id,
      companyId: invitation.companyId,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt.toISOString(),
      revokedAt: invitation.revokedAt?.toISOString() ?? null,
      acceptedAt: invitation.acceptedAt?.toISOString() ?? null,
      createdAt: invitation.createdAt.toISOString(),
    };
  }
}
