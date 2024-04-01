import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/http-exceptions.filter';
import { WebsocketExceptionsFilter } from './filters/websocket-exceptions.filter';
import { DEVELOPMENT } from './utils/constants';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      enableDebugMessages: true,
      validateCustomDecorators: true,
    }),
  );
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalFilters(new AllExceptionsFilter(new Logger()));

  const nodeEnv = configService.get('app.nodeEnv');

  const swagger = new DocumentBuilder()
    .setTitle('Chat')
    .setDescription('Chat API description')
    .setVersion('1.0')
    .addBearerAuth();

  if (nodeEnv !== DEVELOPMENT) swagger.addServer('/api');

  const swaggerConfig = swagger.build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
  });

  await app.listen(configService.get('app.port'));
  return configService.get('app.port');
}
bootstrap().then((PORT) =>
  Logger.log(`App is running on http://localhost:${PORT}`),
);
