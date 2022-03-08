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
  const [ownerOfAll, user1, user2, user3, user4, user5, user6, user7, user8, user9] = accounts;

  let clny;
  let lp;
  let chef;

  before(async () => {
    clny = await TestClnyToken.deployed();
    lp = await TestLPToken.deployed();
    chef = await ColonyChef.deployed();
  });

  afterEach(async () => {
    console.log('user3 slp', ((await lp.balanceOf(user3)) * 1e-18).toFixed(3), 'clny', ((await clny.balanceOf(user3)) * 1e-18).toFixed(3));
    console.log('user4 slp', ((await lp.balanceOf(user4)) * 1e-18).toFixed(3), 'clny', ((await clny.balanceOf(user4)) * 1e-18).toFixed(3));
    console.log('user5 slp', ((await lp.balanceOf(user5)) * 1e-18).toFixed(3), 'clny', ((await clny.balanceOf(user5)) * 1e-18).toFixed(3));
    console.log('user6 slp', ((await lp.balanceOf(user6)) * 1e-18).toFixed(3), 'clny', ((await clny.balanceOf(user6)) * 1e-18).toFixed(3));
  });

  // chef clny balance shall be 0
  after(async () => {
    const balance = await clny.balanceOf(chef.address);
    console.log(balance * 1e-18)
  });

  it('Approve, transfer', async () => {
    await clny.approve(chef.address, constants.MAX_UINT256, { from: ownerOfAll });
    await lp.transfer(user3, ether('100'), { from: ownerOfAll });
    await lp.transfer(user4, ether('100'), { from: ownerOfAll });
    await lp.transfer(user5, ether('100'), { from: ownerOfAll });
    await lp.transfer(user6, ether('100'), { from: ownerOfAll });
    await lp.approve(chef.address, constants.MAX_UINT256, { from: user3 });
    await lp.approve(chef.address, constants.MAX_UINT256, { from: user4 });
    await lp.approve(chef.address, constants.MAX_UINT256, { from: user5 });
    await lp.approve(chef.address, constants.MAX_UINT256, { from: user6 });
  });

  it('User3 stakes 1 slp at 0 days', async () => {
    await chef.deposit(ether('1'), { from: user3 });
  });

  it('User4 stakes 2 slp at 0.5 days', async () => {
    time.increase(60 * 60 * 12);
    await chef.deposit(ether('2'), { from: user4 });
  });

  it('User5 stakes 4 slp at 0.5 days', async () => {
    await chef.deposit(ether('4'), { from: user5 });
  });

  it('User3 unstakes 1 slp at 1.5 days', async () => {
    time.increase(60 * 60 * 24);
    await chef.withdraw(ether('1'), { from: user3 });
  });

  it('User4 unstakes 2 slp at 2 days', async () => {
    time.increase(60 * 60 * 12);
    await chef.withdraw(ether('2'), { from: user4 });
  });

  it('User6 stakes 2 slp at 3 days', async () => {
    time.increase(60 * 60 * 24);
    await chef.deposit(ether('2'), { from: user6 });
  });

  it('User5 unstakes 4 slp at 4 days', async () => {
    time.increase(60 * 60 * 24);
    await chef.withdraw(ether('4'), { from: user5 });
  });

  it('User6 unstakes 2 slp at 4 days', async () => {
    await chef.withdraw(ether('2'), { from: user6 });
    const slp3 = await lp.balanceOf(user3) * 1e-18;
    const clny3 = await clny.balanceOf(user3) * 1e-18;
    const slp4 = await lp.balanceOf(user4) * 1e-18;
    const clny4 = await clny.balanceOf(user4) * 1e-18;
    const slp5 = await lp.balanceOf(user5) * 1e-18;
    const clny5 = await clny.balanceOf(user5) * 1e-18;
    const slp6 = await lp.balanceOf(user6) * 1e-18;
    const clny6 = await clny.balanceOf(user6) * 1e-18;
    assert(Math.round(slp3) === 100);
    assert(Math.round(slp4) === 100);
    assert(Math.round(slp5) === 100);
    assert(Math.round(slp6) === 100);
    expect(clny3).to.be.above(150);
    expect(clny3).to.be.below(155);
    expect(clny4).to.be.above(650);
    expect(clny4).to.be.below(665);
    expect(clny5).to.be.above(4800);
    expect(clny5).to.be.below(4810);
    expect(clny6).to.be.above(700);
    expect(clny6).to.be.below(705);
  });

});
