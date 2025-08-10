// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract UDT is ERC20 {
  constructor(string memory name, string memory symbol, uint initialSupply) ERC20(name, symbol) {
    _mint(msg.sender, initialSupply * 10 ** 18);
  }
}

contract XRP is ERC20 {
  constructor(string memory name, string memory symbol, uint initialSupply) ERC20(name, symbol) {
    _mint(msg.sender, initialSupply * 10 ** 18);
  }
}

contract ETH is ERC20 {
  constructor(string memory name, string memory symbol, uint initialSupply) ERC20(name, symbol) {
    _mint(msg.sender, initialSupply * 10 ** 18);
  }
}

contract BTC is ERC20 {
  constructor(string memory name, string memory symbol, uint initialSupply) ERC20(name, symbol) {
    _mint(msg.sender, initialSupply * 10 ** 18);
  }
}

contract SOL is ERC20 {
  constructor(string memory name, string memory symbol, uint initialSupply) ERC20(name, symbol) {
    _mint(msg.sender, initialSupply * 10 ** 18);
  }
}

contract DOGE is ERC20 {
  constructor(string memory name, string memory symbol, uint initialSupply) ERC20(name, symbol) {
    _mint(msg.sender, initialSupply);
  }
}

contract SHIB is ERC20 {
  constructor(string memory name, string memory symbol, uint initialSupply) ERC20(name, symbol) {
    _mint(msg.sender, initialSupply * 10 ** 18);
  }
}

contract ADA is ERC20 {
  constructor(string memory name, string memory symbol, uint initialSupply) ERC20(name, symbol) {
    _mint(msg.sender, initialSupply * 10 ** 18);
  }
}

contract DOT is ERC20 {
  constructor(string memory name, string memory symbol, uint initialSupply) ERC20(name, symbol) {
    _mint(msg.sender, initialSupply * 10 ** 18);
  }
}
