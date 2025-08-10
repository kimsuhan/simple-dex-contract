"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolController = void 0;
const pool_service_1 = require("./pool.service");
const common_1 = require("@nestjs/common");
let PoolController = class PoolController {
    constructor(poolService) {
        this.poolService = poolService;
    }
    async getPools() {
        return this.poolService.getPools();
    }
    async getStats() {
        return this.poolService.getStats();
    }
    async getEvent(tokenA, tokenB) {
        const poolKey = this.poolService.getPoolKey(tokenA, tokenB);
        return this.poolService.getPoolEvents(poolKey);
    }
};
exports.PoolController = PoolController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "getPools", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':tokenA/:tokenB/events'),
    __param(0, (0, common_1.Param)('tokenA')),
    __param(1, (0, common_1.Param)('tokenB')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PoolController.prototype, "getEvent", null);
exports.PoolController = PoolController = __decorate([
    (0, common_1.Controller)('pools'),
    __metadata("design:paramtypes", [pool_service_1.PoolService])
], PoolController);
//# sourceMappingURL=pool.controller.js.map