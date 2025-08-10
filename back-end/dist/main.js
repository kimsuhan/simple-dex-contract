"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pool_service_1 = require("./modules/pool/pool.service");
const core_1 = require("@nestjs/core");
require("dotenv/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    const poolService = app.get(pool_service_1.PoolService);
    await poolService.init();
    await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
//# sourceMappingURL=main.js.map