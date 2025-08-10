import { PoolService } from '@/modules/pool/pool.service';
import { NestFactory } from '@nestjs/core';
import 'dotenv/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const poolService = app.get(PoolService);
  await poolService.init();

  await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();
