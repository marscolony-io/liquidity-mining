// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract TestClnyToken is ERC20 {
  constructor () ERC20('TestColony', 'TCLNY') {
    _mint(msg.sender, 100000 * 1e18);
  }
}
