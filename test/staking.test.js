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

  console.log(ownerOfAll, user1, user2);

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
    await lp.approve(chef.address, constants.MAX_UINT256, { from: user1 });
    await lp.approve(chef.address, constants.MAX_UINT256, { from: user2 });
  });

  it('User1 stakes', async () => {
    await chef.deposit(ether('10'), { from: user1 });
  });

  it('User1 withdraws after 24h', async () => {
    console.log('1 day passing');
    time.increase(60 * 60 * 24);
    await chef.withdraw(ether('10'), { from: user1 });
  });

  it('User1 stakes after 24h', async () => {
    time.increase(60 * 60 * 24);
    await chef.deposit(ether('10'), { from: user1 });
  });

  it('User2 stakes', async () => {
    await chef.deposit(ether('1'), { from: user2, gas: 200_000 });
    await chef.deposit(ether('1'), { from: user2, gas: 200_000 });
    await chef.deposit(ether('1'), { from: user2, gas: 200_000 });
    await chef.deposit(ether('1'), { from: user2, gas: 200_000 });
    await chef.deposit(ether('1'), { from: user2, gas: 200_000 });
    await chef.deposit(ether('1'), { from: user2, gas: 200_000 });
    await chef.deposit(ether('1'), { from: user2, gas: 200_000 });
    await chef.deposit(ether('1'), { from: user2, gas: 200_000 });
    await chef.deposit(ether('1'), { from: user2, gas: 200_000 });
    await chef.deposit(ether('1'), { from: user2, gas: 200_000 });
  });

  it('User1 unstakes after 24h', async () => {
    time.increase(60 * 60 * 24);
    const user1Data = await chef.userInfo(user1);
    await chef.withdraw(user1Data.amount, { from: user1 });
  });

  it('User2 unstakes', async () => {
    const user2Data = await chef.userInfo(user2);
    const tx = chef.withdraw(user2Data.amount, { from: user2, gas: 200_000 });
    // console.log(tx)
    await tx;
    const slp1 = await lp.balanceOf(user1) * 1e-18;
    const clny1 = await clny.balanceOf(user1) * 1e-18;
    const slp2 = await lp.balanceOf(user2) * 1e-18;
    const clny2 = await clny.balanceOf(user2) * 1e-18;
    assert(Math.round(slp1) === 100);
    assert(Math.round(slp2) === 100);
    expect(clny1).to.be.above(1050);
    expect(clny1).to.be.below(1065);
    expect(clny2).to.be.above(1050);
    expect(clny2).to.be.below(1065);
  });

});
