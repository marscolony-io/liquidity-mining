const { assert, expect } = require('chai');
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

contract('Staking', (accounts) => {
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

  it('User1 stakes 1 slp at 0 days', async () => {
    await chef.deposit(ether('1'), { from: user1 });
    assert(await chef.providerCount() == 1);
  });

  it('User2 stakes 3 slp at 1.5 days', async () => {
    time.increase(60 * 60 * 24 * 1.5);
    await chef.deposit(ether('3'), { from: user2 });
    assert(await chef.providerCount() == 2);
  });

  it('User3 stakes 5 slp at 2 days', async () => {
    await time.increase(60 * 60 * 12);
    await chef.deposit(ether('5'), { from: user3 });
    assert(await chef.providerCount() == 3);
  });

  it('User3 unstakes 5 slp at 2.5 days', async () => {
    await time.increase(60 * 60 * 6);
    await time.increase(60 * 60 * 6);
    await chef.withdraw(ether('5'), { from: user3 });
    assert(await chef.providerCount() == 2);
  });

  it('User2 unstakes 3 slp at 3 days', async () => {
    await time.increase(60 * 60 * 12);
    await chef.withdraw(ether('3'), { from: user2 });
    assert(await chef.providerCount() == 1);
  });

  it('User1 unstakes 1 slp at 3.5 days', async () => {
    await time.increase(60 * 60 * 12);
    await time.advanceBlock();
    // const pending1 = await chef.pendingClny(user1);
    // console.log(pending1 * 1e-18);
    await chef.withdraw(ether('1'), { from: user1 });
    assert(await chef.providerCount() == 0);
    const slp1 = await lp.balanceOf(user1) * 1e-18;
    const clny1 = await clny.balanceOf(user1) * 1e-18;
    const slp2 = await lp.balanceOf(user2) * 1e-18;
    const clny2 = await clny.balanceOf(user2) * 1e-18;
    const slp3 = await lp.balanceOf(user3) * 1e-18;
    const clny3 = await clny.balanceOf(user3) * 1e-18;
    assert(Math.round(slp1) === 100);
    assert(Math.round(slp2) === 100);
    assert(Math.round(slp3) === 100);
    expect(clny1).to.be.above(2742);
    expect(clny1).to.be.below(2755);
    expect(clny2).to.be.above(1925);
    expect(clny2).to.be.below(1929);
    expect(clny3).to.be.above(583);
    expect(clny3).to.be.below(585);
  });

});
