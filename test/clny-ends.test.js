const { assert, expect } = require('chai');
const {
  BN,
  constants,
  ether,
  time,
  expectRevert,
} = require('@openzeppelin/test-helpers');

const TestClnyToken = artifacts.require('TestClnyToken');
const TestLPToken = artifacts.require('TestLPToken');
const ColonyChef = artifacts.require('ColonyChef');

contract('When CLNY ends', (accounts) => {
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
  });

  it('Set big reward, deposit', async () => {
    await clny.approve(chef.address, constants.MAX_UINT256, { from: ownerOfAll });
    await lp.transfer(user1, ether('100'), { from: ownerOfAll });
    await lp.approve(chef.address, constants.MAX_UINT256, { from: user1 });
    assert(await chef.providerCount() == 0);
    await chef.changeClnyPerSecond(Math.floor(ether('100') / 86400), { from: ownerOfAll });
    await chef.deposit(ether('2'), { from: user1 });
    await time.increase(60 * 60 * 24 * 30);
  });

  it('Withdraw', async () => {
    await chef.withdraw(ether('1'), { from: user1 });
  });

  it('Withdraw when not enough', async () => {
    await time.increase(60 * 60 * 24 * 1000);
    await expectRevert(chef.withdraw(ether('1'), { from: user1 }), 'ERC20: transfer amount exceeds balance');
  });

  it('Emergency withdraw when not enough', async () => {
    await chef.emergencyWithdraw({ from: user1 });
  });
});
