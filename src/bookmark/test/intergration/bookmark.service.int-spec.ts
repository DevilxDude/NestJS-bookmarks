import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { BookmarkService } from 'src/bookmark/bookmark.service';
import { CreateBookmarkDto } from 'src/bookmark/dto';
import { PrismaService } from 'src/prisma/prisma.service';

describe('Bookmark Service Integration', () => {
  let prisma: PrismaService;
  let bookmarkService: BookmarkService;

  let bookmarkId: number;
  let userId: number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleRef.createNestApplication();

    prisma = app.get(PrismaService);
    prisma.cleanDb();

    bookmarkService = moduleRef.get(BookmarkService);
  });

  describe('createBookmark()', () => {
    it('Should Create a User', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'ddude786@gmail.com',
          password: '123456',
        },
      });
      userId = user.id;
    });

    it('Should create a Bookmark', async () => {
      const createBody: CreateBookmarkDto = {
        title: 'Google',
        description: 'Search Engine',
        link: 'https://www.google.com',
      };

      const bookmark = await bookmarkService.createBookmark(userId, createBody);

      expect(bookmark.title).toBe(createBody.title);
      expect(bookmark.description).toBe(createBody.description);
      expect(bookmark.link).toBe(createBody.link);

      bookmarkId = bookmark.id;
    });
  });

  describe('editBookmarkById()', () => {
    it('Should edit a Bookmark', async () => {
      const editBody: CreateBookmarkDto = {
        title: 'Youtube',
        description: 'Video Platform',
        link: 'https://www.youtube.com',
      };

      const bookmark = await bookmarkService.editBookmarkById(
        userId,
        bookmarkId,
        editBody,
      );

      expect(bookmark.title).toBe(editBody.title);
      expect(bookmark.description).toBe(editBody.description);
      expect(bookmark.link).toBe(editBody.link);
    });
  });
});
