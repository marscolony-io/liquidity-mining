const ColonyChef = artifacts.require('ColonyChef');
const ERC20 = artifacts.require('ERC20');
const LPStatsUsdcClny = artifacts.require('LPStatsUsdcClny');

module.exports = async (deployer, network, accounts) => {
  if (network === 'development') {
    return;
  }


  await deployer.deploy(
    LPStatsUsdcClny,
    '0x8A1A4957153f9055aF0AEC3Bdc1a247D74d0e869',
    '0xBf255d8c30DbaB84eA42110EA7DC870F01c0013A', // USDC-ONE from SUSHI
    '0x211E6db1D406C68b60ad6553016b73E0F12AdfC1' // CHEF
  );
  const inst = await LPStatsUsdcClny.deployed();
  const apr = await inst.getAPR();
  console.log({ getAPR: +apr });

  const getYearlyDollarRewards = await inst.getYearlyDollarRewards();
  console.log({ getYearlyDollarRewards: getYearlyDollarRewards * 1e-18 });

  const getLockedSLP = await inst.getLockedSLP();
  console.log({ getLockedSLP: getLockedSLP * 1e-18 });

  const getSlpPrice = await inst.getSLPPrice();
  console.log({ getSlpPrice: getSlpPrice * 1e-18 });

  const tvl = await inst.getDollarTVL();
  console.log({ getDollarTVL: +tvl * 1e-18 });
};

// later we need to approve all clny from clny wallet to chef
