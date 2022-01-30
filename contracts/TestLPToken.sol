// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract TestLPToken is ERC20 {
  constructor () ERC20('TestLP', 'TLP') {
    _mint(msg.sender, 100000 * 1e18);
  }
}
