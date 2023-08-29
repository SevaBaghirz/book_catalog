import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class BookAuthorInput {
  @Field()
  @IsUUID(4)
  @IsNotEmpty()
  bookId: string;

  @Field()
  @IsUUID(4)
  @IsNotEmpty()
  authorId: string;
}
