// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestTokenA is ERC20 {
    constructor() ERC20("Test Token A", "TTA") {
        _mint(msg.sender, 1000000 * 10**18); // 100만개 발행
    }
    
    // 테스트 편의를 위한 mint 함수
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}