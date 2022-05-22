const Timelock = artifacts.require('TokenTimelock');

module.exports = async (deployer, network, accounts) => {
  // const latestBlock = await web3.eth.getBlock('latest');
  // await deployer.deploy(
  //   ColonyChef,
  //   '0x0D625029E21540aBdfAFa3BFC6FD44fB4e0A66d0', // clny
  //   '0xcd818813f038a4d1a27c84d24d74bbc21551fa83', // slp
  //   '0xcA6B850102A2f95CE7088edA2F62469e1D90fdE8', // cnly wallet
  //   web3.utils.toWei(new web3.utils.BN(29)).div(new web3.utils.BN(60 * 60 * 24)),
  //   latestBlock.timestamp + 60 * 15,
  // );
  // await deployer.deploy(
  //   Timelock,
  //   '0x0D625029E21540aBdfAFa3BFC6FD44fB4e0A66d0', // clny
  //   '0xE4712F3999Bf8FAAf2a0dA7aAF58D22554495525', // benef
  //   1677830400 // Friday, 3 March 2023 г., 8:00:00);
  // );
};

// later we need to approve all clny from clny wallet to chef
