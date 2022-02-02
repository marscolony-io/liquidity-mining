const TestLPToken = artifacts.require('TestLPToken');
const TestClnyToken = artifacts.require('TestClnyToken');
const ColonyChef = artifacts.require('ColonyChef');

module.exports = async (deployer, network, accounts) => {
  // const latestBlock = await web3.eth.getBlock('latest');
  // await deployer.deploy(
  //   ColonyChef,
  //   '0x0D625029E21540aBdfAFa3BFC6FD44fB4e0A66d0', // clny
  //   '0xcd818813f038a4d1a27c84d24d74bbc21551fa83', // slp
  //   '0x3A47a5be317DCF439F91D0A45716B64547F21bc1', // cnly wallet
  //   web3.utils.toWei('1'),
  //   latestBlock.timestamp + 60 * 60 * 9,
  // );
};
