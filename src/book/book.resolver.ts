import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { BookService } from './book.service';
import { Book } from 'src/book/book.model';
import { BookInput } from 'src/book/book.dto/book-input.dto';
import { ParseUUIDPipe } from '@nestjs/common';

@Resolver('Book')
export class BookResolver {
  constructor(private bookService: BookService) {}

  @Query((returns) => Book, { nullable: true })
  async getBook(
    @Args('id', { type: () => String }, new ParseUUIDPipe({ version: '4' }))
    id: string,
  ) {
    return this.bookService.getBookWithAuthors(id);
  }

  @Query(() => [Book])
  async getBooks(@Args('title') title: string) {
    return this.bookService.getBooks(title);
  }

  @Mutation(() => Book)
  async createBook(@Args('book') bookInput: BookInput) {
    return this.bookService.createBook(bookInput);
  }

  @Mutation(() => Int)
  async deleteBook(
    @Args('id', { type: () => String }, new ParseUUIDPipe({ version: '4' }))
    id: string,
  ) {
    return this.bookService.deleteBook(id);
  }
}
