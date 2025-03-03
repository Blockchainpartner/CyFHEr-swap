// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.24;

import {ICyfherFactory} from "../interfaces/ICyfherFactory.sol";
import {ICyfherRouter} from "../interfaces/ICyfherRouter.sol";
import {ICyfherPair} from "../interfaces/ICyfherPair.sol";
import {CyfherSwapLibrary} from "../libraries/CyfherSwapLibrary.sol";
import {IPFHERC20} from "../interfaces/IPFHERC20.sol";
import "@fhenixprotocol/contracts/utils/debug/Console.sol";
import {Permissioned, Permission} from "@fhenixprotocol/contracts/access/Permissioned.sol";
import "@fhenixprotocol/contracts/FHE.sol";

contract CyfherRouter {
    // is ICyfherRouter {
    //solhint-disable-next-line immutable-vars-naming
    address public immutable factory;

    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, "UniswapV2Router: EXPIRED");
        _;
    }

    constructor(address _factory) {
        factory = _factory;
    }

    // **** ADD LIQUIDITY ****
    function _addLiquidity(
        address tokenA,
        address tokenB,
        euint32 amountADesired,
        euint32 amountBDesired
    ) internal virtual returns (euint32 amountA, euint32 amountB) {
        if (ICyfherFactory(factory).getPair(tokenA, tokenB) == address(0)) {
            ICyfherFactory(factory).createPair(tokenA, tokenB);
        }
        (euint32 reserveA, euint32 reserveB) = CyfherSwapLibrary.getReserves(
            factory,
            tokenA,
            tokenB
        );

        ebool reserveAEq0 = FHE.eq(reserveA, FHE.asEuint32(0));
        ebool reserveBEq0 = FHE.eq(reserveB, FHE.asEuint32(0));
        // TO CHECK IF THIS CHANGE FROM "AND" OPERATOR TO "OR" OPERATOR INTRODUCES BREAKING CHANGES. Especially if first
        // liquidity provisioning is single sided
        if (
            FHE.decrypt(reserveAEq0) == true || FHE.decrypt(reserveBEq0) == true
        ) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            euint32 amountBOptimal = CyfherSwapLibrary.quote(
                amountADesired,
                reserveA,
                reserveB
            );
            euint32 amountAOptimal = CyfherSwapLibrary.quote(
                amountBDesired,
                reserveB,
                reserveA
            );
            ebool amountBOptimalLteAmountBDesired = FHE.lte(
                amountBOptimal,
                amountBDesired
            );
            amountA = FHE.select(
                amountBOptimalLteAmountBDesired,
                amountADesired,
                amountAOptimal
            );
            amountB = FHE.select(
                amountBOptimalLteAmountBDesired,
                amountBOptimal,
                amountBDesired
            );
        }
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        inEuint32 calldata encryptedAmountADesired,
        inEuint32 calldata encryptedAmountBDesired,
        Permission memory permissionA,
        Permission memory permissionB,
        address to
    ) external returns (euint32 amountA, euint32 amountB, euint32 liquidity) {
        euint32 amountADesired = FHE.asEuint32(encryptedAmountADesired);
        euint32 amountBDesired = FHE.asEuint32(encryptedAmountBDesired);
        // creating the pair

        (amountA, amountB) = _addLiquidity(
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired
        );
        address pair = CyfherSwapLibrary.pairFor(factory, tokenA, tokenB);
        Console.log("pair :", pair);
        IPFHERC20(tokenA).unsafe_transferFrom(
            msg.sender,
            pair,
            amountA,
            permissionA
        );
        IPFHERC20(tokenB).unsafe_transferFrom(
            msg.sender,
            pair,
            amountB,
            permissionB
        );

        //   return pair;
        liquidity = ICyfherPair(pair).mint(to);
    }
}
