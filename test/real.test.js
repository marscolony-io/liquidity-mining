const { assert } = require('chai');
const {
  BN,
  constants,
  expectEvent,
  expectRevert,
  ether,
  time,
} = require('@openzeppelin/test-helpers');

const TestClnyToken = artifacts.require('TestClnyToken');
const TestLPToken = artifacts.require('TestLPToken');
const ColonyChef = artifacts.require('ColonyChef');

contract('Changing price and staking', (accounts) => {
  const [ownerOfAll, user1, user2, user3, user4, user5] = accounts;

  let clny;
  let lp;
  let chef;

  before(async () => {
    clny = await TestClnyToken.deployed();
    lp = await TestLPToken.deployed();
    chef = await ColonyChef.deployed();
  });

  afterEach(async () => {
    console.log('user1 slp', ((await lp.balanceOf(user1)) * 1e-18).toFixed(3), 'clny', ((await clny.balanceOf(user1)) * 1e-18).toFixed(3));
    console.log('user2 slp', ((await lp.balanceOf(user2)) * 1e-18).toFixed(3), 'clny', ((await clny.balanceOf(user2)) * 1e-18).toFixed(3));
    console.log('user3 slp', ((await lp.balanceOf(user3)) * 1e-18).toFixed(3), 'clny', ((await clny.balanceOf(user3)) * 1e-18).toFixed(3));
  });

  // chef clny balance shall be 0
  after(async () => {
    const balance = await clny.balanceOf(chef.address);
    console.log(balance * 1e-18)
  });

  it('Approve, transfer', async () => {
    await clny.approve(chef.address, constants.MAX_UINT256, { from: ownerOfAll });
    await lp.transfer(user1, ether('100'), { from: ownerOfAll });
    await lp.transfer(user2, ether('100'), { from: ownerOfAll });
    await lp.transfer(user3, ether('100'), { from: ownerOfAll });
    await lp.approve(chef.address, constants.MAX_UINT256, { from: user1 });
    await lp.approve(chef.address, constants.MAX_UINT256, { from: user2 });
    await lp.approve(chef.address, constants.MAX_UINT256, { from: user3 });
    assert(await chef.providerCount() == 0);
  });

  const D = user1;
  const E = user2;
  const P = user3;

  it('Set 12 clny/day; D stakes 2 slp at 1 days', async () => {
    await chef.changeClnyPerSecond(Math.floor(ether('12') / 86400), { gas: 400_000 });
    await time.increase(60 * 60 * 24);
    await chef.deposit(ether('2'), { from: D });
  });

  it('E stakes 2 slp 12 min later', async () => {
    await time.increase(60 * 12);
    await chef.deposit(ether('2'), { from: E });
  });

  it('P stakes 2 slp 36 min later', async () => {
    await time.increase(60 * 36);
    await chef.deposit(ether('2'), { from: P });
  });

  it('Set 48 clny/day 100 min later', async () => {
    await time.increase(60 * 100);
    const providers = await chef.getProviders();
    await chef.changeClnyPerSecond(Math.floor(ether('48') / 86400), { gas: 400_000 });
  });

  it('Set 6 clny/day 115 min later', async () => {
    await time.increase(60 * 115);
    const providers = await chef.getProviders();
    await chef.changeClnyPerSecond(Math.floor(ether('6') / 86400), { gas: 400_000 });
  });

  it('D stakes 2 slp', async () => {
    await chef.deposit(ether('2'), { from: D , gas: 200_000 });
  });

  it('E stakes 1 slp 30 min later', async () => {
    await time.increase(60 * 30);
    await chef.deposit(ether('1'), { from: E });
  });

  it('E unstakes 1 slp 2 min later', async () => {
    await time.increase(60 * 2);
    await chef.withdraw(ether('1'), { from: E });
  });

  it('Set 96 clny/day', async () => {
    const providers = await chef.getProviders();
    await chef.changeClnyPerSecond(Math.floor(ether('96') / 86400), { gas: 400_000 });
  });

  it('E unstakes 1 slp 5 min later', async () => {
    await time.increase(60 * 5);
    await chef.withdraw(ether('1'), { from: E });
  });

  it('Stop 85 min later', async () => {
    await time.increase(60 * 85);
    const providers = await chef.getProviders();
    await chef.changeClnyPerSecond(ether('0'), { gas: 400_000 });
  });

  it('Withdraw later', async () => {
    await time.increase(60 * 60 * 24 * 365);
    await chef.withdraw(ether('4'), { from: D });
    await chef.withdraw(ether('1'), { from: E });
    await chef.withdraw(ether('2'), { from: P });
    // user1 slp 100.000 clny 5.282
    // user2 slp 100.000 clny 2.635
    // user3 slp 100.000 clny 3.294
  });

});
