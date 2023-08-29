import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomValidationPipe } from 'src/pipes/custom-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.useGlobalPipes(CustomValidationPipe);

  const PORT = process.env.PORT || 5000;
  await app.listen(PORT, () => {
    console.log(`APP RUNNING ON PORT: ${PORT}`);
  });
}
bootstrap();
