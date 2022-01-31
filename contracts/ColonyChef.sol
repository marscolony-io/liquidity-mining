// SPDX-License-Identifier: MIT

pragma solidity 0.8.11;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';


// ColonyChef is the master of ColonyToken. He can make CLNY and he is a fair guy. (Forked from SUSHI MasterChef)
//
// Note that it's ownable and the owner wields tremendous power. The ownership
// will be transferred to a governance smart contract once ColonyToken is sufficiently
// distributed and the community can show to govern itself.
//
// Have fun reading it. Hopefully it's bug-free. God bless.
contract ColonyChef is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;
    // Info of each user.
    struct UserInfo {
        uint256 amount; // How many LP tokens the user has provided.
        uint256 rewardDebt; // Reward debt. See explanation below.
        uint256 fixedReward; // to store what we should pay to the user (in case of changing clnyPerDay)
        //
        // We do some fancy math here. Basically, any point in time, the amount of ColonyToken
        // entitled to a user but is pending to be distributed is:
        //
        //   pending reward = (user.amount * accColonyPerShare) - user.rewardDebt
        //
        // Whenever a user deposits or withdraws LP tokens to a pool. Here's what happens:
        //   1. The pool's `accColonyPerShare` (and `lastRewardTime`) gets updated.
        //   2. User receives the pending reward sent to his/her address.
        //   3. User's `amount` gets updated.
        //   4. User's `rewardDebt` gets updated.
    }


    IERC20 public lpToken; // Address of LP token contract.
    uint256 lastRewardTime; // Last time number that CLNYs distribution occurs.
    uint256 accColonyPerShare; // Accumulated CLNYs per share, times 1e12. See below.
    // The CLNY TOKEN!
    IERC20 public clnyToken;
    // Liquidity pool - funds should be approved for this contract
    address public clnyPool;
    // CLNY tokens got from liquidity wallet per 24h.
    uint256 public clnyPerDay;
    // Info of each user that stakes LP tokens.
    mapping(address => UserInfo) public userInfo;
    // list of liquidity providers
    EnumerableSet.AddressSet private providers;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 amount);

    constructor(
        IERC20 _clnyToken,
        IERC20 _lpToken,
        address _clnyPool,
        uint256 _clnyPerDay,
        uint256 _startTime
    ) {
        clnyToken = _clnyToken;
        lpToken = _lpToken;
        clnyPool = _clnyPool;
        clnyPerDay = _clnyPerDay;
        // The time when CLNY distribution starts.
        lastRewardTime = _startTime;
    }

    // View function with providers count
    function providerCount() view public returns (uint256) {
        return providers.length();
    }

    // Get provider at index
    function getProvider(uint256 index) view public returns (address) {
        return providers.at(index);
    }

    // Get providers
    function getProviders() view public returns (address[] memory) {
        return providers.values();
    }

    // View function to see pending ColonyToken on frontend.
    function pendingClny(address _user) external view returns (uint256) {
        UserInfo storage user = userInfo[_user];
        uint256 lpSupply = lpToken.balanceOf(address(this));
        uint256 _accColonyPerShare = accColonyPerShare;
        if (block.timestamp > lastRewardTime && lpSupply != 0) {
            uint256 clnyReward = block.timestamp.sub(lastRewardTime).mul(clnyPerDay).div(1 days);
            _accColonyPerShare = _accColonyPerShare.add(clnyReward.mul(1e12).div(lpSupply));
        }
        return user.amount.mul(_accColonyPerShare).div(1e12).sub(user.rewardDebt).add(user.fixedReward);
    }

    // Update reward variables to be up-to-date.
    function updatePool() public {
        if (block.timestamp <= lastRewardTime) {
            return;
        }
        uint256 lpSupply = lpToken.balanceOf(address(this));
        if (lpSupply == 0) {
            lastRewardTime = block.timestamp;
            return;
        }
        // (now - lastRewardTime) * clnyPerDay / day:
        uint256 clnyReward = block.timestamp.sub(lastRewardTime).mul(clnyPerDay).div(1 days);
        clnyToken.safeTransferFrom(address(clnyPool), address(this), clnyReward);
        accColonyPerShare = accColonyPerShare.add(clnyReward.mul(1e12).div(lpSupply));
        lastRewardTime = block.timestamp;
    }

    // Deposit LP tokens to ColonyChef for CLNY allocation.
    function deposit(uint256 _amount) public {
        UserInfo storage user = userInfo[msg.sender];
        updatePool();
        if (user.amount > 0 || user.fixedReward > 0) {
            uint256 pending = user.amount.mul(accColonyPerShare).div(1e12).sub(user.rewardDebt).add(user.fixedReward);
            safeClnyTransfer(msg.sender, pending);
            user.fixedReward = 0;
        }
        lpToken.safeTransferFrom(
            address(msg.sender),
            address(this),
            _amount
        );
        user.amount = user.amount.add(_amount);
        user.rewardDebt = user.amount.mul(accColonyPerShare).div(1e12);
        providers.add(msg.sender);
        emit Deposit(msg.sender, _amount);
    }

    // Withdraw LP tokens from ColonyChef.
    function withdraw(uint256 _amount) public {
        _withdraw(_amount, msg.sender);
    }

    function _withdraw(uint256 _amount, address _address) internal {
        UserInfo storage user = userInfo[_address];
        require(user.amount >= _amount, 'withdraw: not good');
        updatePool();
        uint256 pending = user.amount.mul(accColonyPerShare).div(1e12).sub(user.rewardDebt).add(user.fixedReward);
        safeClnyTransfer(msg.sender, pending);
        user.amount = user.amount.sub(_amount);
        user.rewardDebt = user.amount.mul(accColonyPerShare).div(1e12);
        user.fixedReward = 0;
        if (user.amount == 0) {
            providers.remove(_address);
        }
        lpToken.safeTransfer(address(_address), _amount);
        emit Withdraw(_address, _amount);
    }

    // fix user reward in userInfo
    // should be run after updatePool
    function _fixAfterPoolUpdate(address _address) internal {
        UserInfo storage user = userInfo[_address];
        uint256 pending = user.amount.mul(accColonyPerShare).div(1e12).sub(user.rewardDebt).add(user.fixedReward);
        clnyToken.safeTransferFrom(address(clnyPool), address(this), pending.sub(user.fixedReward));
        user.fixedReward = pending;
        user.rewardDebt = user.amount.mul(accColonyPerShare).div(1e12);
    }

    // store users' rewards without transferring them
    // needed before changing clny per day speed
    function fixRewards(address[] calldata addresses) external onlyOwner {
        updatePool();
        for (uint256 i = 0; i < addresses.length; i++) {
            _fixAfterPoolUpdate(addresses[i]);
        }
    }

    // WARNING: you should fix all rewards by fixRewards before changing clnyPerDay
    // WARNING: it isn't chechked as it would be a gas dependent cycle
    function changeClnyPerDay(uint256 newSpeed) external onlyOwner {
        clnyPerDay = newSpeed;
    }

    // Withdraw without caring about rewards. EMERGENCY ONLY.
    function emergencyWithdraw() public {
        UserInfo storage user = userInfo[msg.sender];
        lpToken.safeTransfer(address(msg.sender), user.amount);
        emit EmergencyWithdraw(msg.sender, user.amount);
        user.amount = 0;
        user.rewardDebt = 0;
    }

    // Safe ColonyToken transfer function, just in case if pool doesn't have enough CLNY.
    function safeClnyTransfer(address _to, uint256 _amount) internal {
        uint256 clnyBal = clnyToken.balanceOf(address(this));
        if (_amount > clnyBal) {
            clnyToken.transfer(_to, clnyBal);
        } else {
            clnyToken.transfer(_to, _amount);
        }
    }
}
