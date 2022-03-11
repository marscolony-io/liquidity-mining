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

contract('Pending clny', (accounts) => {
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
  });

  it('Approve, transfer, set clny per second', async () => {
    await clny.approve(chef.address, constants.MAX_UINT256, { from: ownerOfAll });
    await lp.transfer(user1, ether('100'), { from: ownerOfAll });
    await lp.approve(chef.address, constants.MAX_UINT256, { from: user1 });
    assert(await chef.providerCount() == 0);
    await chef.changeClnyPerSecond(Math.floor(ether('12') / 86400), { from: ownerOfAll });
  });

  it('Deposit', async () => {
    await chef.deposit(ether('1'), { from: user1 });
    const pending = await chef.pendingClny(user1, { from: user1 });
    expect(parseInt(pending)).to.be.equal(0);
    await time.increase(60 * 60 * 24 + 60 * 60 * 24); // offset + time
  });

  it('Get pending clny', async () => {
    const pending = await chef.pendingClny(user1, { from: user1 });
    const pendingDecimal = parseInt(pending) * 1e-18;
    expect(pendingDecimal).to.be.above(12);
    expect(pendingDecimal).to.be.below(12.1);
  });

  it('Withdraw', async () => {
    await chef.withdraw(ether('1'), { from: user1 });
  });
});
