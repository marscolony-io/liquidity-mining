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

contract('Changing clny pool', (accounts) => {
  const [ownerOfAll, user1, user2, user3] = accounts;

  let clny;
  let lp;
  let chef;
  let oldPool;

  before(async () => {
    clny = await TestClnyToken.deployed();
    lp = await TestLPToken.deployed();
    chef = await ColonyChef.deployed();
  });

  it('Change clny pool', async () => {
    oldPool = await chef.clnyPool();
    await chef.changeClnyPool(user3, { from: ownerOfAll });
    expect(await chef.clnyPool()).to.be.equal(user3);
  });

  it('Change clny pool back', async () => {
    await chef.changeClnyPool(oldPool, { from: ownerOfAll });
    expect(await chef.clnyPool()).to.be.equal(oldPool);
  });

  it('Change clny pool - only owner', async () => {
    await expectRevert(chef.changeClnyPool(user3, { from: user1 }), 'Ownable: caller is not the owner');
  });

});
