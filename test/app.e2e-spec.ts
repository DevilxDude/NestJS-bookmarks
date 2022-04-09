import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from 'src/app.module';
import { AuthDto } from 'src/auth/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto } from 'src/user/dto';

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

    describe('Edit User', () => {
      const body: EditUserDto = {
        email: 'hammad@gmail.com',
        firstName: 'Hammad',
        lastName: 'Akhtar',
      };

      it('Should edit user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(body)
          .expectStatus(200)
          .expectBodyContains(body.email)
          .expectBodyContains(body.firstName)
          .expectBodyContains(body.lastName);
      });
    });
  });

  describe('Bookmarks', () => {
    const createBody: CreateBookmarkDto = {
      title: 'Google',
      description: 'Search Engine',
      link: 'https://www.google.com',
    };

    const editBody: EditBookmarkDto = {
      title: 'Facebook',
      description: 'Social Media',
      link: 'https://www.facebook.com',
    };

    describe('Get empty bookmarks', () => {
      it('Should return an empty array of bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create Bookmark', () => {
      it('Should create a bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(createBody)
          .expectStatus(201)
          .expectBodyContains(createBody.title)
          .expectBodyContains(createBody.description)
          .expectBodyContains(createBody.link)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get Bookmarks', () => {
      it('Should return an array with a single bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get Bookmark by ID', () => {
      it('Should return a single bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks/{bookmarkId}')
          .withPathParams({
            bookmarkId: '$S{bookmarkId}',
          })
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}')
          .expectBodyContains(createBody.title)
          .expectBodyContains(createBody.description)
          .expectBodyContains(createBody.link);
      });
    });

    describe('Edit Bookmark by ID', () => {
      it('Should edit a bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{bookmarkId}')
          .withPathParams({
            bookmarkId: '$S{bookmarkId}',
          })
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(editBody)
          .expectStatus(200)
          .expectBodyContains(editBody.title)
          .expectBodyContains(editBody.description)
          .expectBodyContains(editBody.link);
      });
    });

    describe('Delete Bookmark by ID', () => {
      it('Should delete the bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{bookmarkId}')
          .withPathParams({
            bookmarkId: '$S{bookmarkId}',
          })
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204)
          .inspect();
      });

      it('Should return an empty array of bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]);
      });

      it('Should throw an error if bookmark does not exist', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{bookmarkId}')
          .withPathParams({
            bookmarkId: '$S{bookmarkId}',
          })
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(404);
      });
    });
  });
});
