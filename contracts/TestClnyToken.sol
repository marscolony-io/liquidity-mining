// SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract TestClnyToken is ERC20 {
  constructor () ERC20('TestClny', 'TCLNY') {
    _mint(msg.sender, 100000 * 1e18);
  }
}
