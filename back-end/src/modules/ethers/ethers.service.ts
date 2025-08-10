import { Injectable } from '@nestjs/common';
import { Contract, ethers, Provider } from 'ethers';
import SimpleDexAbi from './consts/simple-dex.abi';

@Injectable()
export class EthersService {
  provider: Provider;
  dexContract: Contract;

  constructor() {
    const address = process.env.DEX_CONTRACT_ADDRESS;
    if (!address) {
      throw new Error('DEX_CONTRACT_ADDRESS is not set');
    }

    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

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
