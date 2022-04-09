import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from 'src/app.module';
import { AuthDto } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/prisma.service';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const body: AuthDto = {
      email: 'ddude786@gmail.com',
      password: 'Password@123',
    };

    describe('Register', () => {
      it('Should Register', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(body)
          .expectStatus(201);
      });

      it('Should Throw Exception when no body is provided', () => {
        return pactum.spec().post('/auth/register').expectStatus(400);
      });

      it('Should Throw Exception if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody({
            password: body.password,
          })
          .expectStatus(400);
      });

      it('Should Throw Exception if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody({
            email: body.email,
          })
          .expectStatus(400);
      });

      it('Should Throw Exception if email is already registerd', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(body)
          .expectStatus(409);
      });
    });

    describe('Login', () => {
      it('Should Login', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(body)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });

      it('Should Throw Exception when no body is provided', () => {
        return pactum.spec().post('/auth/login').expectStatus(400);
      });

      it('Should Throw Exception if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            password: body.password,
          })
          .expectStatus(400);
      });

      it('Should Throw Exception if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: body.email,
          })
          .expectStatus(400);
      });
    });
  });

  describe('User', () => {
    describe('Get Me', () => {
      it('Should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });

    // describe('Edit User', () => {});
  });

  // describe('Bookmarks', () => {
  //   describe('Create Bookmark', () => {});

  //   describe('Get Bookmarks', () => {});

  //   describe('Get Bookmark by ID', () => {});

  //   describe('Edit Bookmark by ID', () => {});

  //   describe('Delete Bookmark by ID', () => {});
  // });
});
