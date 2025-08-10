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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthersService = void 0;
const common_1 = require("@nestjs/common");
const ethers_1 = require("ethers");
const simple_dex_abi_1 = require("./consts/simple-dex.abi");
let EthersService = class EthersService {
    constructor() {
        const address = process.env.DEX_CONTRACT_ADDRESS;
        if (!address) {
            throw new Error('DEX_CONTRACT_ADDRESS is not set');
        }
        this.provider = new ethers_1.ethers.JsonRpcProvider(process.env.RPC_URL);
        if (!this.provider) {
            throw new Error('RPC_URL is not set');
        }
        this.dexContract = new ethers_1.ethers.Contract(address, simple_dex_abi_1.default, this.provider);
        if (!this.dexContract) {
            throw new Error('DEX_CONTRACT_ADDRESS is not valid');
        }
    }
};
exports.EthersService = EthersService;
exports.EthersService = EthersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EthersService);
//# sourceMappingURL=ethers.service.js.map