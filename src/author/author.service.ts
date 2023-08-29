import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthorInput } from 'src/author/author.dto/author-input.dto';
import { Author } from '@prisma/client';

@Injectable()
export class AuthorService {
  constructor(private readonly prisma: PrismaService) {}

  async getAuthor(id: string) {
    const author = await this.prisma.author.findUnique({
      where: { id },
      include: {
        books: {
          select: {
            book: true,
          },
        },
      },
    });

    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    const extractedBooks = author.books.map((b) => b.book);

    return {
      ...author,
      books: extractedBooks,
    };
  }

  async getAuthorsWitBooks(min?: number, max?: number) {
    const authors: Author[] = await this.prisma.$queryRaw`
      SELECT a.*
      FROM "author" AS a
      LEFT JOIN "book_author" AS ba ON a.id = ba.author_id
      GROUP BY a.id
      HAVING COUNT(ba.book_id) >= COALESCE(${min}, 0)
      AND COUNT(ba.book_id) <= COALESCE(${max}, 999999)
    `;

    const authorsWithBooks = await Promise.all(
      authors.map(async (author) => {
        const books = await this.prisma.book.findMany({
          where: {
            authors: {
              some: {
                author_id: author.id,
              },
            },
          },
        });
        return {
          ...author,
          books,
        };
      }),
    );

    return authorsWithBooks;
  }

  async createAuthor(data: AuthorInput) {
    return this.prisma.author.create({ data });
  }

  async addAuthorToBook(bookId: string, authorId: string) {
    const bookExists = await this.prisma.book.findUnique({
      where: { id: bookId },
    });
    const authorExists = await this.prisma.author.findUnique({
      where: { id: authorId },
    });

    if (!bookExists || !authorExists) {
      throw new BadRequestException('Book or Author not found.');
    }

    const existingRelation = await this.prisma.bookAuthor.findUnique({
      where: {
        book_id_author_id: {
          book_id: bookId,
          author_id: authorId,
        },
      },
    });

    if (existingRelation) {
      throw new BadRequestException(
        'This author is already added to this book.',
      );
    }

    await this.prisma.bookAuthor.create({
      data: {
        book_id: bookId,
        author_id: authorId,
      },
    });

    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
      include: {
        authors: {
          include: {
            author: true,
          },
        },
      },
    });

    const mappedBook = {
      ...book,
      authors: book.authors.map((bookAuthor) => bookAuthor.author),
    };

    return mappedBook;
  }

  async deleteAuthor(id: string) {
    const deleteAuthorAction = this.prisma.author.delete({ where: { id } });
    const deleteBookAuthorsAction = this.prisma.bookAuthor.deleteMany({
      where: { author_id: id },
    });

    const deleteCount = await this.prisma.$transaction([
      deleteBookAuthorsAction,
      deleteAuthorAction,
    ]);

    return deleteCount ? 1 : 0;
  }

  async deleteAuthorWithBooks(author_id: string): Promise<number> {
    const actions = [];

    const authorBooks = await this.prisma.bookAuthor.findMany({
      where: { author_id },
      select: { book_id: true },
    });

    for (const authorBook of authorBooks) {
      const coAuthors = await this.prisma.bookAuthor.count({
        where: { book_id: authorBook.book_id },
      });
      if (coAuthors === 1) {
        actions.push(
          this.prisma.book.delete({ where: { id: authorBook.book_id } }),
        );
      } else {
        actions.push(
          this.prisma.bookAuthor.delete({
            where: {
              book_id_author_id: {
                book_id: authorBook.book_id,
                author_id,
              },
            },
          }),
        );
      }
    }

    actions.push(this.prisma.author.delete({ where: { id: author_id } }));

    await this.prisma.$transaction(actions);

    return authorBooks.length + 1;
  }
}
