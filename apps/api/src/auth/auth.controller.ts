import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type {
  AuthProfileResponse,
  AuthSessionResponse,
} from '@pulso/contracts';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './current-user.decorator.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import type { AuthenticatedUser } from './auth.types.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() input: RegisterDto): Promise<AuthSessionResponse> {
    return this.authService.register(input);
  }

  @Post('login')
  login(@Body() input: LoginDto): Promise<AuthSessionResponse> {
    return this.authService.login(input);
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  getProfile(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AuthProfileResponse> {
    return this.authService.getProfile(user.userId);
  }
}
