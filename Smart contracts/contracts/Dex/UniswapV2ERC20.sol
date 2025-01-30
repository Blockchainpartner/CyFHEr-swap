// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.24;

import { IUniswapV2ERC20 } from "../interfaces/IUniswapV2ERC20.sol";

import "fhevm/lib/TFHE.sol";
import "hardhat/console.sol";

contract UniswapV2ERC20 is IUniswapV2ERC20 {
    string public constant name = "Uniswap V2";
    string public constant symbol = "UNI-V2";
    // uint8 public constant override decimals = 18;
    euint64 public totalSupply;
    mapping(address => euint64) public balanceOf;
    mapping(address => mapping(address => euint64)) public allowance;

    function _mint(address to, euint64 value) internal {
        totalSupply = TFHE.add(totalSupply, value);
        TFHE.allowThis(totalSupply);
        balanceOf[to] = TFHE.add(balanceOf[to], value); // BE CAREFUL OVERFLOW https://docs.zama.ai/fhevm/fundamentals/operations#beware-of-overflows-of-tfhe-arithmetic-operators
        TFHE.allowThis(balanceOf[to]);

        // emit Transfer(address(0), to, value);
    }

}
