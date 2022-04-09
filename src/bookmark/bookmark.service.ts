import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private readonly prisma: PrismaService) {}

  getBookmarks(userId: number) {
    const bookmarks = this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });

    return bookmarks;
  }

  getBookmarkById(userId: number, bookmarId: number) {
    const bookmark = this.prisma.bookmark.findFirst({
      where: {
        id: bookmarId,
        userId,
      },
    });

    return bookmark;
  }

  createBookmark(userId: number, body: CreateBookmarkDto) {
    const bookmark = this.prisma.bookmark.create({
      data: {
        userId,
        ...body,
      },
    });

    return bookmark;
  }

  async editBookmarkById(
    userId: number,
    bookmarId: number,
    body: EditBookmarkDto,
  ) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarId,
      },
    });

    if (!bookmark) {
      throw new NotFoundException(`Bookmark with id: ${bookmarId} not found`);
    }

    if (bookmark.userId !== userId) {
      throw new ForbiddenException('You are not allowed to edit this bookmark');
    }

    const updatedBookmark = this.prisma.bookmark.update({
      where: {
        id: bookmarId,
      },
      data: {
        ...body,
      },
    });

    return updatedBookmark;
  }

  async deleteBookmarkById(userId: number, bookmarId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarId,
      },
    });

    if (!bookmark) {
      throw new NotFoundException(`Bookmark with id: ${bookmarId} not found`);
    }

    if (bookmark.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this bookmark',
      );
    }

    return this.prisma.bookmark.delete({
      where: {
        id: bookmarId,
      },
    });
  }
}
