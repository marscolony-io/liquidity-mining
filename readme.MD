# Description
- Liquidity Mining contract of [MarsColony](https://marscolony.io) – a Game-Fi Colonisation Framework
- Forked from MasterChef v1 contract: https://github.com/sushiswap/sushiswap/blob/canary/contracts/MasterChef.sol
- Modifications:
    - Migrator deleted because no use
    - SafeMath deleted because no need in newer Solidity version
    - Many pools -> one pool. This contract is only for one pool (CLNY <-> ONE or any specified)
    - Starting bonus removed – we don't use it
    - `toPay` parameter added to `UserInfo` struct – this enables following options >>
    - Depositing doesn't withdraw rewarded CLNY token (the amount adds to `toPay`)
    - Sushi per block -> CLNY per second. Changed per-block rewards to per-second rewards
    - New! Possibility to change clny-per-second reward. See further
    - New! There is a gas-efficient provider list now (users who have provided liquidity)
    - Original contract minted SUSHI. This contract transfers CLNY from predefined address `clnyPool`

# Main actors, actions, flows
- Only two roles: owner and user
- The contract is `Ownable`, so there is an owner
- Owner can: change `clnyPool`
- Owner can: `changeClnyPerSecond`
- ^ all rights of an owner are above, no more
- User – every wallet who provides LP tokens
- User can stake LP tokens in the contract (`deposit`)
- User can `withdraw` LP tokens back to their wallet any time
- User gets reward in CLNY to their wallet along with any withdrawal
- User can `withdraw` 0 LP tokens – this action means just receiving a reward
- User can `emergencyWithdraw` their LP funds – in case if there is any problem with CLNY distribution

# Technical details
- The contract is deployed to Harmony network, ISN'T upgradeable and verified
- [See it in explorer](https://explorer.harmony.one/address/0xe3ff96e6020b8606f923518704970a7afa73dc3f) `0xe3ff96e6020b8606f923518704970a7afa73dc3f`
- Our frontend and telegram/discord bot use view functions in [LPStats contract](https://explorer.harmony.one/address/0x8600f6e9cd3406f8173749a582bc993e74ed7be8) to rapidly get statistics and not flood Harmony with many queries
- (LPStats contract doesn't need audit, just FYI)
- First ~3 hrs after deployment the contract had 29 CLNY/day reward distribution to let people test mechanics
- Then we set 5000 CLNY/day. We didn't change it and don't plan to change yet (actual for 28.02.2022)

# Deployment process
1) ColonyChef contract is manually deployed with: CLNY token address, LP token address, CLNY pool address (wallet/contract with CLNY to distribute), initial CLNY per second reward and starting time in constructor
2) CLNY in CLNY pool should be approved for spending by this new ColonyChef contract
3) CLNY begin to distribute after the specified starting time
4) In the actual deploy to Harmony starting time was the time of deploy, but initial reward was very small to do some tests
5) But the starting time can be a time in the future. Don't set starting time before deploy time
6) Organisation should monitor CLNY amount in CLNY pool. If it ends, users won't be able to get rewards, only to emergency withdraw LP tokens or to wait for CLNY fulfillment

# Contracts - Harmony mainnet
- [See it in explorer](https://explorer.harmony.one/address/0xe3ff96e6020b8606f923518704970a7afa73dc3f) `0xe3ff96e6020b8606f923518704970a7afa73dc3f`
