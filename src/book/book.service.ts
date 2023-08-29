import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookInput } from 'src/book/book.dto/book-input.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BookService {
  constructor(private prisma: PrismaService) {}

  async getBookWithAuthors(id: string) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        authors: {
          select: {
            author: true,
          },
        },
      },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return {
      id: book.id,
      title: book.title,
      authors: book.authors.map((a) => a.author),
    };
  }

  async getBooks(title: string) {
    if (title) {
      return this.prisma.book.findMany({
        where: {
          title: {
            contains: title.replace('%', ''),
            mode: 'insensitive',
          },
        },
      });
    }
    return this.prisma.book.findMany();
  }

  async createBook(data: BookInput) {
    const authors = await this.prisma.author.findMany({
      where: {
        id: {
          in: data.authorIds,
        },
      },
    });

    if (authors.length !== data.authorIds.length) {
      throw new BadRequestException('Some authorIds are invalid');
    }

    const createdBook = await this.prisma.book.create({
      data: {
        title: data.title,
        authors: {
          create: data.authorIds.map((authorId) => ({
            author: { connect: { id: authorId } },
          })),
        },
      },
      include: {
        authors: {
          include: {
            author: true,
          },
        },
      },
    });

    const createdBookWithMappedAuthors = {
      ...createdBook,
      authors: createdBook.authors.map((bookAuthor) => bookAuthor.author),
    };

    return createdBookWithMappedAuthors;
  }

  async deleteBook(id: string): Promise<number> {
    await this.prisma.bookAuthor.deleteMany({
      where: {
        book_id: id,
      },
    });

    const deleteCount = await this.prisma.book.delete({ where: { id } });

    return deleteCount ? 1 : 0;
  }
}
