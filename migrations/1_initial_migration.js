const { BN } = require("bn.js");

const TestLPToken = artifacts.require('TestLPToken');
const TestClnyToken = artifacts.require('TestClnyToken');
const ColonyChef = artifacts.require('ColonyChef');

module.exports = async (deployer, network, accounts) => {
  const latestBlock = await web3.eth.getBlock('latest');
  await Promise.all([
    deployer.deploy(TestLPToken),
    deployer.deploy(TestClnyToken),
  ]);
  await deployer.deploy(
    ColonyChef,
    TestClnyToken.address,
    TestLPToken.address,
    accounts[0], // as clnyPool for test
    web3.utils.toWei(new BN(2100)).div(new BN(60 * 60 * 24)),
    latestBlock.timestamp + 60 * 60 * 24,
  );
};
