import { Resolver, Query, Args, Mutation, Int } from '@nestjs/graphql';
import { Author } from 'src/author/author.model';
import { Book } from 'src/book/book.model';
import { AuthorService } from './author.service';
import { AuthorInput } from 'src/author/author.dto/author-input.dto';
import { BookAuthorInput } from 'src/author/author.dto/book-author.dto';
import { ParseUUIDPipe } from '@nestjs/common';

@Resolver('Author')
export class AuthorResolver {
  constructor(private readonly authorService: AuthorService) {}

  @Query(() => Author, { nullable: true })
  async getAuthor(
    @Args('id', { type: () => String }, new ParseUUIDPipe({ version: '4' }))
    id: string,
  ) {
    return this.authorService.getAuthor(id);
  }

  @Query(() => [Author])
  async getAuthors(
    @Args('minNumberOfBooks', { nullable: true }) min: number,
    @Args('maxNumberOfBooks', { nullable: true }) max: number,
  ) {
    return this.authorService.getAuthorsWitBooks(min, max);
  }

  @Mutation(() => Author)
  async createAuthor(@Args('author') authorData: AuthorInput) {
    return this.authorService.createAuthor(authorData);
  }

  @Mutation(() => Book)
  async addAuthor(@Args('input') input: BookAuthorInput) {
    return this.authorService.addAuthorToBook(input.bookId, input.authorId);
  }

  @Mutation(() => Int)
  async deleteAuthor(
    @Args('id', { type: () => String }, new ParseUUIDPipe({ version: '4' }))
    id: string,
  ) {
    return this.authorService.deleteAuthor(id);
  }

  @Mutation(() => Int)
  async deleteAuthorWithBooks(
    @Args('id', { type: () => String }, new ParseUUIDPipe({ version: '4' }))
    id: string,
  ) {
    return this.authorService.deleteAuthorWithBooks(id);
  }
}
