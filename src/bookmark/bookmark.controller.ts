import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Get()
  getBookmarks(@GetUser('id') userId: number) {
    return this.bookmarkService.getBookmarks(userId);
  }

  @Get(':id')
  getBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarId: number,
  ) {
    return this.bookmarkService.getBookmarkById(userId, bookmarId);
  }

  @Post()
  createBookmark(
    @GetUser('id') userId: number,
    @Body() body: CreateBookmarkDto,
  ) {
    return this.bookmarkService.createBookmark(userId, body);
  }

  @Patch(':id')
  editBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarId: number,
    @Body() body: EditBookmarkDto,
  ) {
    return this.bookmarkService.editBookmarkById(userId, bookmarId, body);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarId: number,
  ) {
    return this.bookmarkService.deleteBookmarkById(userId, bookmarId);
  }
}
