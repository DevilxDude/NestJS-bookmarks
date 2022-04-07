import { ForbiddenException, Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

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

    delete user.password;

    // Send back the user
    return user;
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

      delete user.password;

      //return the saved user
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email is already registered.');
        }
      }
      throw error;
    }
  }
}
