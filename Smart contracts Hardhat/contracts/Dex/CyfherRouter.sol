// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.24;

import {ICyfherFactory} from "../interfaces/ICyfherFactory.sol";
import {ICyfherPair} from "../interfaces/ICyfherPair.sol";
import {CyfherSwapLibrary} from "../libraries/CyfherSwapLibrary.sol";
import {IPFHERC20} from "../interfaces/IPFHERC20.sol";
import {Permissioned, Permission} from "@fhenixprotocol/contracts/access/Permissioned.sol";
import "@fhenixprotocol/contracts/FHE.sol";

contract CyfherRouter {
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
        (amountA, amountB) = (amountADesired, amountBDesired);
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
            ebool amountAOptimalLteAmountADesired = FHE.lte(
                amountAOptimal,
                amountADesired
            );
            ebool amountBOptimalLteAmountBDesired = FHE.lte(
                amountBOptimal,
                amountBDesired
            );
            amountA = FHE.select(
                amountAOptimalLteAmountADesired,
                amountAOptimal,
                amountADesired
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
        if (ICyfherFactory(factory).getPair(tokenA, tokenB) == address(0)) {
            ICyfherFactory(factory).createPair(tokenA, tokenB);
        }

        (amountA, amountB) = _addLiquidity(
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired
        );
        address pair = CyfherSwapLibrary.pairFor(factory, tokenA, tokenB);
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
        //return pair;
        liquidity = ICyfherPair(pair).mint(to);
    }

    // // **** REMOVE LIQUIDITY ****
    function removeLiquidity(
        address tokenA,
        address tokenB,
        inEuint32 calldata encLiquidity,
        Permission memory permissionA,
        address to /* ensure(deadline) */
    ) public virtual returns (euint32 amountA, euint32 amountB) {
        euint32 liquidity = FHE.asEuint32(encLiquidity);
        address pair = CyfherSwapLibrary.pairFor(factory, tokenA, tokenB);

        IPFHERC20(pair).unsafe_transferFrom(
            msg.sender,
            pair,
            liquidity,
            permissionA
        ); // send liquidity to pair
        (euint32 amount0, euint32 amount1) = ICyfherPair(pair).burn(to);

        (address token0, ) = CyfherSwapLibrary.sortTokens(tokenA, tokenB);
        (amountA, amountB) = tokenA == token0
            ? (amount0, amount1)
            : (amount1, amount0);
    }

    // **** SWAP ****
    // requires the initial amount to have already been sent to the first pair
    function _swap(
        euint32 amountOutMin,
        address[] memory path,
        address _to
    ) internal virtual {
        (address input, address output) = (path[0], path[1]);
        (address token0, ) = CyfherSwapLibrary.sortTokens(path[0], path[1]);
        ebool inputEqToken0 = FHE.eq(
            FHE.asEaddress(input),
            FHE.asEaddress(token0)
        );
        euint32 amount0Out = FHE.select(
            inputEqToken0,
            FHE.asEuint32(0),
            amountOutMin
        );
        euint32 amount1Out = FHE.select(
            inputEqToken0,
            amountOutMin,
            FHE.asEuint32(0)
        );

        address pair = CyfherSwapLibrary.pairFor(factory, input, output);
        ICyfherPair(pair).swap(amount0Out, amount1Out, _to);
    }

    function swapExactTokensForTokens(
        inEuint32 calldata amountInInput,
        inEuint32 calldata amountOutMinInput,
        Permission memory permissionA,
        Permission memory permissionB,
        address[] calldata path,
        address to
    ) external virtual {
        euint32 amountIn = FHE.asEuint32(amountInInput);
        // euint32 amountOutMin = FHE.asEuint32(amountOutMinInput);
        euint32 amountOutput = CyfherSwapLibrary.getAmountOut(
            factory,
            amountIn,
            path
        );
        //FHE.req(FHE.gte(amountOutput, amountOutMin));
        IPFHERC20(path[0]).unsafe_transferFrom(
            msg.sender,
            CyfherSwapLibrary.pairFor(factory, path[0], path[1]),
            amountIn,
            permissionA
        );
        // Mandatory to preserve confidentiality
        IPFHERC20(path[1]).unsafe_transferFrom(
            msg.sender,
            CyfherSwapLibrary.pairFor(factory, path[0], path[1]),
            FHE.asEuint32(0),
            permissionB
        );
        _swap(amountOutput, path, to);
    }
    //this function reveals the amount of the output token and compromises  privacy of
    function EstimategetAmountOut(
        inEuint32 calldata amountIn,
        address[] memory path
    ) external view returns (uint32 amountOut) {
        euint32 input = FHE.asEuint32(amountIn);

        bool isZero = FHE.decrypt(FHE.eq(FHE.asEuint32(0), input));
        if (isZero) {
            return 0;
        }
        // maybe add timelock or noise for output amount
        amountOut = FHE.decrypt(
            CyfherSwapLibrary.getAmountOut(factory, input, path)
        );
    }
}
