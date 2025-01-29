// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";
import "fhevm-contracts/contracts/token/ERC20/extensions/ConfidentialERC20Mintable.sol";

contract CyfherERC20 is SepoliaZamaFHEVMConfig, ConfidentialERC20Mintable {
    constructor() ConfidentialERC20Mintable("Cyfher token", "Cyfhe", msg.sender) {}
}
