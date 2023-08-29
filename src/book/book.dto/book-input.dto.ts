import { Field, InputType, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class BookInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => [ID])
  @IsUUID(4, { each: true })
  @IsNotEmpty({ each: true })
  authorIds: string[];
}
