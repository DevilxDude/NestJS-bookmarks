import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: AuthDto) {
    return this.authService.login(body);
  }

  @Post('register')
  register(@Body() body: AuthDto) {
    return this.authService.register(body);
  }
}
