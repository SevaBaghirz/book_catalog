import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Book } from 'src/book/book.model';

@ObjectType()
export class Author {
  @Field(() => ID)
  id: string;

  @Field()
  first_name: string;

  @Field()
  last_name: string;

  @Field(() => [Book], { nullable: 'items' })
  books?: Book[];
}
