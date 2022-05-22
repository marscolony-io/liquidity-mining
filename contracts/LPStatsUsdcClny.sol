// SPDX-License-Identifier: MIT
pragma solidity =0.8.13;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import './ChefInterface.sol';

contract LPStatsUsdcClny {
  // unchangeable token contracts
  IERC20 constant WONE = IERC20(0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a);
  IERC20 constant USDC = IERC20(0x985458E523dB3d53125813eD68c274899e9DfAb4);
  IERC20 constant CLNY = IERC20(0x0D625029E21540aBdfAFa3BFC6FD44fB4e0A66d0);

  IERC20 public dexUsdcClnyContract; // = IERC20(0xcd818813F038A4d1a27c84d24d74bBC21551FA83);
  IERC20 public dexUsdcOneContract; // = IERC20(0xBf255d8c30DbaB84eA42110EA7DC870F01c0013A);
  ChefInterface public CHEF; // = ChefInterface(0xe3fF96e6020B8606f923518704970A7AfA73DC3f);

  constructor (
    address _dexUsdcClnyContract,
    address _dexUsdcOneContract,
    address _liquidityMining
  ) {
    dexUsdcClnyContract = IERC20(_dexUsdcClnyContract);
    dexUsdcOneContract = IERC20(_dexUsdcOneContract);
    CHEF = ChefInterface(_liquidityMining);
  }

  function getOnePrice() public view returns (uint256) {
    uint256 usdcInLiq = USDC.balanceOf(address(dexUsdcOneContract));
    uint256 woneInLiq = WONE.balanceOf(address(dexUsdcOneContract));
    return usdcInLiq * 1e18 * 1e18 / woneInLiq / 1e6;
  }

  function getClnyPrice() public view returns (uint256, uint256) {
    uint256 usdcInLiq = USDC.balanceOf(address(dexUsdcClnyContract)) * 1e12 /* 18 - 6 */;
    uint256 clnyInLiq = CLNY.balanceOf(address(dexUsdcClnyContract));
    uint256 clnyPrice = usdcInLiq * 1e18 / clnyInLiq;
    return (clnyPrice * 1e18 / getOnePrice(), clnyPrice); // in ONE, in dollars
  }

  function getSLPPrice() public view returns (uint256) {
    uint256 circulatingSLPSupply = dexUsdcClnyContract.totalSupply();
    uint256 usdcInLiq = USDC.balanceOf(address(dexUsdcClnyContract)) * 1e12 /* = 18 - 6 */;
    uint256 totalInDollars = 2 * usdcInLiq;
    return totalInDollars * 1e18 / circulatingSLPSupply;
  }

  function getDollarTVL() external view returns (uint256) {
    uint256 slpLocked = dexUsdcClnyContract.balanceOf(address(CHEF));
    return slpLocked * getSLPPrice() / 1e18;
  }

  function getDailyClnyRewards() public view returns (uint256) {
    return CHEF.clnyPerSecond() * 60 * 60 * 24;
  }

  function getYearlyDollarRewards() public view returns (uint256) {
    (, uint256 clnyPriceInDollars) = getClnyPrice();
    return getDailyClnyRewards() * clnyPriceInDollars * 36524 / 100; // ~365.24 days in a year
  }

  function getLockedSLP() public view returns (uint256) {
    return dexUsdcClnyContract.balanceOf(address(CHEF));
  }

  function getAPR() public view returns (uint256) {
    return getYearlyDollarRewards() * 1e18 / getLockedSLP() / getSLPPrice();
  }
}
