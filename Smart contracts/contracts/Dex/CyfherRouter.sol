// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.24;

import { ICyfherFactory } from "../interfaces/ICyfherFactory.sol";
import { ICyfherRouter } from "../interfaces/ICyfherRouter.sol";
import { ICyfherPair } from "../interfaces/ICyfherPair.sol";
import { IWETH } from "../interfaces/IWETH.sol";

import { UniswapV2Library } from "../libraries/UniswapV2Library.sol";

import "fhevm/lib/TFHE.sol";
import { SepoliaZamaFHEVMConfig } from "fhevm/config/ZamaFHEVMConfig.sol";

import { ICyfherERC20 } from "../interfaces/ICyfherERC20.sol";

contract CyfherRouter is ICyfherRouter, SepoliaZamaFHEVMConfig {
    //solhint-disable-next-line immutable-vars-naming
    address public immutable override factory;
    address public immutable override WETH;

    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, "UniswapV2Router: EXPIRED");
        _;
    }

    constructor(address _factory, address _WETH) {
        factory = _factory;
        WETH = _WETH;
    }

    receive() external payable {
        assert(msg.sender == WETH); // only accept ETH via fallback from the WETH contract
    }

    // **** ADD LIQUIDITY ****
    function _addLiquidity(
        address tokenA,
        address tokenB,
        euint64 amountADesired,
        euint64 amountBDesired
    ) internal virtual returns (euint64 amountA, euint64 amountB) {
        if (ICyfherFactory(factory).getPair(tokenA, tokenB) == address(0)) {
            ICyfherFactory(factory).createPair(tokenA, tokenB);
        }
        //(uint256 reserveA, uint256 reserveB) = UniswapV2Library.getReserves(factory, tokenA, tokenB);

        //if (reserveA == 0 && reserveB == 0) {
        (amountA, amountB) = (amountADesired, amountBDesired);
        //} else {
        // uint256 amountBOptimal = UniswapV2Library.quote(amountADesired, reserveA, reserveB);
        // if (amountBOptimal <= amountBDesired) {
        //     require(amountBOptimal >= amountBMin, "UniswapV2Router: INSUFFICIENT_B_AMOUNT");
        //     (amountA, amountB) = (amountADesired, amountBOptimal);
        // } else {
        //     uint256 amountAOptimal = UniswapV2Library.quote(amountBDesired, reserveB, reserveA);
        //     assert(amountAOptimal <= amountADesired);
        //     require(amountAOptimal >= amountAMin, "UniswapV2Router: INSUFFICIENT_A_AMOUNT");
        //     (amountA, amountB) = (amountAOptimal, amountBDesired);
        // }
        //}
    }

    // ERROR STACK TOO DEEP IF I USE 4 INPUT VARIABLES. Temporarily use 2, will implement struct() later on.
    function addLiquidity(
        address tokenA,
        address tokenB,
        einput encryptedAmountADesired,
        einput encryptedAmountBDesired,
        bytes calldata inputProof,
        address to
    ) external virtual override returns (euint64 amountA, euint64 amountB, euint64 liquidity) {

        euint64 amountADesired = TFHE.asEuint64(encryptedAmountADesired, inputProof);
        euint64 amountBDesired = TFHE.asEuint64(encryptedAmountBDesired, inputProof);

        (amountA, amountB) = _addLiquidity(tokenA, tokenB, amountADesired, amountBDesired);
        address pair = UniswapV2Library.pairFor(factory, tokenA, tokenB);

        TFHE.allowTransient(amountA, tokenA);
        TFHE.allowTransient(amountB, tokenB);

        ICyfherERC20(tokenA).transferFrom(msg.sender, pair, amountA);
        ICyfherERC20(tokenB).transferFrom(msg.sender, pair, amountB);

        liquidity = ICyfherPair(pair).mint(to);
    }
}
