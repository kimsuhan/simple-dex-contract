// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestTokenB is ERC20 {
    constructor() ERC20("Test Token B", "TTB") {
        _mint(msg.sender, 2000000 * 10**18); // 200만개 발행
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}