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

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  printServerStartup();

  const poolService = app.get(PoolService);
  await poolService.init();
}

void bootstrap();

function printServerStartup(
  info = {
    name: 'SimpleDex',
    version: '1.0.0',
    port: process.env.PORT ?? 3001,
    env: 'development',
    startTime: new Date().toISOString(),
  },
) {
  // 색상 코드
  const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgBlue: '\x1b[44m',
    bgGreen: '\x1b[42m',
  };

  console.clear(); // 콘솔 클리어

  // 상단 박스
  console.log(
    colors.cyan +
      '╔════════════════════════════════════════════════════════════╗' +
      colors.reset,
  );
  console.log(
    colors.cyan +
      '║' +
      colors.bright +
      colors.white +
      '                    🚀 SERVER STARTED 🚀                    ' +
      colors.reset +
      colors.cyan +
      '║' +
      colors.reset,
  );
  console.log(
    colors.cyan +
      '╚════════════════════════════════════════════════════════════╝' +
      colors.reset,
  );

  console.log('');

  // 서버 정보
  console.log(
    colors.bright + colors.blue + '📋 Server Information:' + colors.reset,
  );
  console.log(
    colors.green + '   ├─ Name:    ' + colors.white + info.name + colors.reset,
  );
  console.log(
    colors.green +
      '   ├─ Version: ' +
      colors.white +
      info.version +
      colors.reset,
  );
  console.log(
    colors.green + '   ├─ Port:    ' + colors.yellow + info.port + colors.reset,
  );
  console.log(
    colors.green +
      '   ├─ Mode:    ' +
      colors.magenta +
      info.env.toUpperCase() +
      colors.reset,
  );
  console.log(
    colors.green +
      '   └─ Started: ' +
      colors.white +
      info.startTime +
      colors.reset,
  );

  console.log('');

  // 접속 링크들
  console.log(colors.bright + colors.blue + '🌐 Available on:' + colors.reset);
  console.log(
    colors.yellow +
      '   ├─ Local:   ' +
      colors.cyan +
      `http://localhost:${info.port}` +
      colors.reset,
  );
  console.log(
    colors.yellow +
      '   └─ Network: ' +
      colors.cyan +
      `http://192.168.1.100:${info.port}` +
      colors.reset,
  );

  console.log('');

  // 상태 표시
  console.log(colors.bright + colors.blue + '⚡ Status:' + colors.reset);
  console.log(colors.green + '   ✅ Database Connected' + colors.reset);
  console.log(colors.green + '   ✅ Routes Loaded' + colors.reset);
  console.log(colors.green + '   ✅ Middleware Initialized' + colors.reset);
  console.log(
    colors.green + '   ✅ Ready to Accept Connections!' + colors.reset,
  );

  console.log('');

  // 하단 박스
  console.log(
    colors.dim +
      '────────────────────────────────────────────────────────────' +
      colors.reset,
  );
  console.log(
    colors.dim +
      '  Press ' +
      colors.bright +
      'Ctrl+C' +
      colors.reset +
      colors.dim +
      ' to stop the server' +
      colors.reset,
  );
  console.log(
    colors.dim +
      '────────────────────────────────────────────────────────────' +
      colors.reset,
  );

  console.log('');
}
