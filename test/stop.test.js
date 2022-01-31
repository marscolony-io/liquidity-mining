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
    console.log('user4 slp', ((await lp.balanceOf(user4)) * 1e-18).toFixed(3), 'clny', ((await clny.balanceOf(user4)) * 1e-18).toFixed(3));
    console.log('user5 slp', ((await lp.balanceOf(user5)) * 1e-18).toFixed(3), 'clny', ((await clny.balanceOf(user5)) * 1e-18).toFixed(3));
  });

  it('Approve, transfer', async () => {
    await clny.approve(chef.address, constants.MAX_UINT256, { from: ownerOfAll });
    await lp.transfer(user1, ether('100'), { from: ownerOfAll });
    await lp.transfer(user2, ether('100'), { from: ownerOfAll });
    await lp.transfer(user3, ether('100'), { from: ownerOfAll });
    await lp.transfer(user4, ether('100'), { from: ownerOfAll });
    await lp.transfer(user5, ether('100'), { from: ownerOfAll });
    await lp.approve(chef.address, constants.MAX_UINT256, { from: user1 });
    await lp.approve(chef.address, constants.MAX_UINT256, { from: user2 });
    await lp.approve(chef.address, constants.MAX_UINT256, { from: user3 });
    await lp.approve(chef.address, constants.MAX_UINT256, { from: user4 });
    await lp.approve(chef.address, constants.MAX_UINT256, { from: user5 });
    assert(await chef.providerCount() == 0);
  });

  it('User3 stakes 1 slp at 0 days', async () => {
    await chef.deposit(ether('1'), { from: user3 });
  });

  it('User2 stakes 2 slp at 0.5 days', async () => {
    await time.increase(60 * 60 * 24 * 0.5);
    await chef.deposit(ether('2'), { from: user2 });
  });

  it('User4 stakes 2 slp at 0.5 day', async () => {
    await chef.deposit(ether('2'), { from: user4 });
  });

  it('User5 stakes 3 slp at 0.5 day', async () => {
    await chef.deposit(ether('3'), { from: user5 });
  });

  it('User1 stakes 2 slp at 1 day', async () => {
    await time.increase(60 * 60 * 24 * 0.5);
    await chef.deposit(ether('2'), { from: user1 });
  });

  it('Manually changing reward to 1000 at 2 day', async () => {
    await time.increase(60 * 60 * 24 * 1);
    const providers = await chef.getProviders();
    assert(providers.length === 5);
    assert(providers.includes(user1) && providers.includes(user2) && providers.includes(user3) && providers.includes(user4) && providers.includes(user5));
    // A MUST! Fix rewards for all providers manually before changing speed
    await chef.fixRewards(providers);
    await chef.changeClnyPerDay(ether('1000'), { gas: 400_000 });
  });

  it('User2 unstakes 2 slp at 2.5 days', async () => {
    await time.increase(60 * 60 * 24 * 0.5);
    await chef.withdraw(ether('2'), { from: user2 });
  });

  it('User5 unstakes 3 slp at 3 days', async () => {
    await time.increase(60 * 60 * 24 * 0.5);
    await chef.withdraw(ether('3'), { from: user5 });
  });

  it('Manually changing reward to 2000 at 3 day', async () => {
    const providers = await chef.getProviders();
    assert(providers.length === 3);
    assert(providers.includes(user1) && providers.includes(user3) && providers.includes(user4));

    // A MUST! Fix rewards for all providers manually before changing speed
    await chef.fixRewards(providers);
    await chef.changeClnyPerDay(ether('2000'), { gas: 400_000 });
  });

  it('Manually changing reward to 0 at 4 day', async () => {
    await time.increase(60 * 60 * 24 * 1);
    const providers = await chef.getProviders();
    assert(providers.length === 3);
    assert(providers.includes(user1) && providers.includes(user3) && providers.includes(user4));

    // A MUST! Fix rewards for all providers manually before changing speed
    await chef.fixRewards(providers);
    await chef.changeClnyPerDay(ether('0'), { gas: 400_000 });
  });

  it('User1 unstakes 2 slp at 4.5 day', async () => {
    await time.increase(60 * 60 * 24 * 0.5);
    await chef.withdraw(ether('2'), { from: user1 });
  });

  it('User3 unstakes 1 slp at 4.5 days', async () => {
    await chef.withdraw(ether('1'), { from: user3 });
  });

  it('User4 unstakes 2 slp at 4.5 days', async () => {
    await chef.withdraw(ether('2'), { from: user4 });
  });
});
