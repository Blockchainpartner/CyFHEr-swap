// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {PFHERC20} from "../tokens/PFHERC20.sol";
import "@fhenixprotocol/contracts/FHE.sol";

contract CyfherERC20 is PFHERC20 {
    constructor() PFHERC20("CyfherERC20", "Cyf", 3) {}
}
