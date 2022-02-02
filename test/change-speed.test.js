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
  const [ownerOfAll, user1, user2, user3] = accounts;

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

  it('User1 stakes 1 slp at 0.5 days', async () => {
    await time.increase(60 * 60 * 24 * 0.5);
    await chef.deposit(ether('1'), { from: user1 });
  });

  it('User3 stakes 4 slp at 0.5 days', async () => {
    await chef.deposit(ether('4'), { from: user3 });
  });

  it('User2 stakes 2 slp at 1 day', async () => {
    await time.increase(60 * 60 * 24 * 0.5);
    await chef.deposit(ether('2'), { from: user2 });
  });

  it('Manually changing reward to 4200 at 2 day', async () => {
    await time.increase(60 * 60 * 24 * 1);
    const providers = await chef.getProviders();
    assert(providers.length === 3);
    assert(providers.includes(user1) && providers.includes(user2) && providers.includes(user3));
    // A MUST! Fix rewards for all providers manually before changing speed
    await chef.fixRewards(providers);
    await chef.changeClnyPerSecond(ether(new BN(4200)).div(new BN(86400)), { gas: 400_000 });
  });

  it('User2 unstakes 2 slp at 2.5 days', async () => {
    await time.increase(60 * 60 * 24 * 0.5);
    await chef.withdraw(ether('2'), { from: user2 });
  });

  it('User1 unstakes 1 slp at 3 days', async () => {
    await time.increase(60 * 60 * 24 * 0.5);
    await chef.withdraw(ether('1'), { from: user1 });
  });

    it('Manually changing reward to 3150 at 4 day', async () => {
    await time.increase(60 * 60 * 24 * 1);
    const providers = await chef.getProviders();
    assert(providers.length === 1);
    assert(providers.includes(user3));
    const data = await chef.userInfo(user3);

    // A MUST! Fix rewards for all providers manually before changing speed
    await chef.fixRewards(providers);
    await chef.changeClnyPerSecond(ether(new BN(3150)).div(new BN(86400)), { gas: 400_000 });
  });

  it('User1 stakes 3 slp at 4 day', async () => {
    await chef.deposit(ether('3'), { from: user1 });
  });

  it('User1 unstakes 3 slp at 5 days', async () => {
    await time.increase(60 * 60 * 24 * 1);
    await chef.withdraw(ether('3'), { from: user1 });
  });

  it('User3 unstakes 4 slp at 5 days', async () => {
    await chef.withdraw(ether('4'), { from: user3 });
    // user1 slp 100.000 clny 2370.255
    // user2 slp 100.000 clny 1200.076
    // user3 slp 100.000 clny 10081.212
  });
});
