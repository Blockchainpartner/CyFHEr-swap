// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";
import "fhevm-contracts/contracts/token/ERC20/extensions/ConfidentialERC20Mintable.sol";

contract PrivateEUR is SepoliaZamaFHEVMConfig, ConfidentialERC20Mintable {
    constructor() ConfidentialERC20Mintable("PrivateEUR", "pEUR", msg.sender) {}
}
