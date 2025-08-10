import { PoolService } from '@/modules/pool/pool.service';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('SimpleDex')
    .setDescription('SimpleDex API description')
    .setVersion('1.0')
    .addTag('SimpleDex')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const poolService = app.get(PoolService);
  await poolService.init();

  await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();
