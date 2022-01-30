const TestLPToken = artifacts.require('TestLPToken');
const TestClnyToken = artifacts.require('TestClnyToken');
const ColonyChef = artifacts.require('ColonyChef');

module.exports = async (deployer, network, accounts) => {
  // console.log(accounts)
  await Promise.all([
    deployer.deploy(TestLPToken),
    deployer.deploy(TestClnyToken),
  ]);
  const currentBlock = await web3.eth.getBlockNumber();
  await deployer.deploy(
    ColonyChef,
    TestClnyToken.address,
    TestLPToken.address,
    accounts[0], // as clnyPool for test
    web3.utils.toWei('2100'),
    new web3.utils.BN(currentBlock),
  );
};
