const CC = artifacts.require('ColonyChef');
const { BN } = require("bn.js");

module.exports = async (callback) => {
  try {
    const accounts = await web3.eth.getAccounts();
    const cc = await CC.at('0xe3fF96e6020B8606f923518704970A7AfA73DC3f');

    await cc.updatePool();

    await cc.changeClnyPerSecond(web3.utils.toWei(new BN(500)).div(new BN(60 * 60 * 24)));

    callback();
  } catch (error) {
    console.log(error);
  }
};