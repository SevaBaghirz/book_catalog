import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Author } from 'src/author/author.model';

@ObjectType()
export class Book {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => [Author], { nullable: 'items' })
  authors?: Author[];
}
