import {
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  @HttpCode(HttpStatus.OK)
  async login(body: AuthDto) {
    // Find User by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    // If user does not exist throw exception
    if (!user) {
      throw new ForbiddenException('Invalid email or password.');
    }

    // Compare the password has with the has in the database
    const validPassword = await argon.verify(user.password, body.password);

    // If the password is not correct throw exception
    if (!validPassword) {
      throw new ForbiddenException('Invalid email or password.');
    }

    // return user token;
    return this.signToken(user.id, user.email);
  }

  async register(body: AuthDto) {
    // Generate the password has
    const hash = await argon.hash(body.password);

    try {
      // Save the new user in the database
      const user = await this.prisma.user.create({
        data: {
          email: body.email,
          password: hash,
        },
      });

      // return user token;
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email is already registered.');
        }
      }
      throw error;
    }
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{
    access_token: string;
  }> {
    const payload = { sub: userId, email };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret,
    });

    return {
      access_token: token,
    };
  }
}
