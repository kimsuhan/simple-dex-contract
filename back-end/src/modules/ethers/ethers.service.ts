import { Injectable } from '@nestjs/common';
import { Contract, ethers, Provider, WebSocketProvider } from 'ethers';
import SimpleDexAbi from './consts/simple-dex.abi';

@Injectable()
export class EthersService {
  provider: Provider;
  wsProvider: WebSocketProvider;
  dexContract: Contract;

  constructor() {
    const address = process.env.DEX_CONTRACT_ADDRESS;
    if (!address) {
      throw new Error('DEX_CONTRACT_ADDRESS is not set');
    }

    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    this.wsProvider = new ethers.WebSocketProvider('ws://localhost:8545');

    if (!this.provider) {
      throw new Error('RPC_URL is not set');
    }

    this.dexContract = new ethers.Contract(
      address,
      SimpleDexAbi,
      this.provider,
    );

    if (!this.dexContract) {
      throw new Error('DEX_CONTRACT_ADDRESS is not valid');
    }
  }
}
