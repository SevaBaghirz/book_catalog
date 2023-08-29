import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApolloDriver } from '@nestjs/apollo';
import { AuthorModule } from './author/author.module';
import { BookModule } from './book/book.module';
import { createComplexityLimitRule } from 'graphql-validation-complexity';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
      sortSchema: true,
      introspection: true,
      path: '/api/graphql',
      autoValidateInput: true,
      validationRules: [
        createComplexityLimitRule(1000, {
          onCost: (cost) => {
            console.log('Query cost:', cost);
          },
        }),
      ],
    }),
    AuthorModule,
    BookModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
