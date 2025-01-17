// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm-contracts/contracts/token/ERC20/extensions/ConfidentialERC20Mintable.sol";

contract TokenDistributor {
    function acceptOwnership(address tokenAddress) external {
        ConfidentialERC20Mintable(tokenAddress).acceptOwnership();
    }

    function claim(address tokenAddress) external {
        uint64 amount = 100;

        ConfidentialERC20Mintable(tokenAddress).mint(msg.sender, amount);
    }
}
