import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import argon2 from 'argon2';
import type {
  AuthProfileResponse,
  AuthSessionResponse,
  AuthUserProfile,
  CompanyMembershipProfile,
} from '@pulso/contracts';
import { PrismaService } from '../prisma/prisma.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

const userWithMemberships = {
  memberships: {
    include: {
      company: true,
    },
  },
} satisfies Prisma.UserInclude;

type UserWithMemberships = Prisma.UserGetPayload<{
  include: typeof userWithMemberships;
}>;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterDto): Promise<AuthSessionResponse> {
    const passwordHash = await argon2.hash(input.password, {
      type: argon2.argon2id,
    });

    let user: UserWithMemberships;
    try {
      user = await this.prisma.user.create({
        data: {
          email: input.email,
          name: input.name.trim(),
          passwordHash,
          memberships: {
            create: {
              role: 'OWNER',
              company: {
                create: {
                  name: input.companyName.trim(),
                },
              },
            },
          },
        },
        include: userWithMemberships,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('An account with this email already exists');
      }

      throw error;
    }

    return this.createSession(user);
  }

  async login(input: LoginDto): Promise<AuthSessionResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
      include: userWithMemberships,
    });

    if (!user || !(await argon2.verify(user.passwordHash, input.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createSession(user);
  }

  async getProfile(userId: string): Promise<AuthProfileResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: userWithMemberships,
    });

    if (!user) {
      throw new UnauthorizedException('User account no longer exists');
    }

    return this.toProfile(user);
  }

  private async createSession(
    user: UserWithMemberships,
  ): Promise<AuthSessionResponse> {
    const profile = this.toProfile(user);
    const accessToken = await this.jwtService.signAsync({
      sub: profile.user.id,
    });

    return {
      ...profile,
      accessToken,
      tokenType: 'Bearer',
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    };
  }

  private toProfile(user: UserWithMemberships): AuthProfileResponse {
    const profile: AuthUserProfile = {
      id: user.id,
      email: user.email,
      name: user.name,
    };
    const memberships: CompanyMembershipProfile[] = user.memberships.map(
      (membership) => ({
        companyId: membership.companyId,
        companyName: membership.company.name,
        role: membership.role,
      }),
    );

    return { user: profile, memberships };
  }
}
