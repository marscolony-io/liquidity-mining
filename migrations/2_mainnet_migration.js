const ColonyChef = artifacts.require('ColonyChef');
const ERC20 = artifacts.require('ERC20');
const LPStats = artifacts.require('LPStats');

module.exports = async (deployer, network, accounts) => {
  if (network === 'development') {
    return;
  }
  const latestBlock = await web3.eth.getBlock('latest');
  // const dexContract = '0xD5D191c733306A8Fe9C9A3166D9cbe2a0E407979'; // CLP CLNY<->ONE
  const dexContract = '0x8A1A4957153f9055aF0AEC3Bdc1a247D74d0e869'; // CLP CLNY<->1USDC
  const lpPool = '0xcA6B850102A2f95CE7088edA2F62469e1D90fdE8';
  const clny = '0x0D625029E21540aBdfAFa3BFC6FD44fB4e0A66d0';
  await deployer.deploy(
    ColonyChef,
    clny, // clny
    dexContract, // slp
    lpPool,
    web3.utils.toWei(new web3.utils.BN(1)).div(new web3.utils.BN(60 * 60 * 24)),
    latestBlock.timestamp + 60 * 15,
  );
  const CLNY = await ERC20.at(clny);
  await CLNY.approve(ColonyChef.address, lpPool);
  await deployer.deploy(
    LPStats,
    dexContract,
    '0xBf255d8c30DbaB84eA42110EA7DC870F01c0013A', // USDC-ONE from SUSHI
    ColonyChef.address // CHEF
  );
};

// later we need to approve all clny from clny wallet to chef
