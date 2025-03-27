// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.24;

//solhint-disable reason-string

import {ICyfherPair} from "../interfaces/ICyfherPair.sol";
import {ICyfherFactory} from "../interfaces/ICyfherFactory.sol";
import "@fhenixprotocol/contracts/FHE.sol";

library CyfherSwapLibrary {
    // returns sorted token addresses, used to handle return values from pairs sorted in this order
    function sortTokens(
        address tokenA,
        address tokenB
    ) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, "CyfherSwapLibrary: IDENTICAL_ADDRESSES");
        (token0, token1) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);
        require(token0 != address(0), "CyfherSwapLibrary: ZERO_ADDRESS");
    }

    // calculates the CREATE2 address for a pair without making any external calls
    // The PAIRFOR function does not work, it is completely normal https://forum.openzeppelin.com/t/uniswap-fork-testing-hardhat/14472/7
    function pairFor(
        address factory,
        address tokenA,
        address tokenB
    ) internal view returns (address pair) {
        // (address token0, address token1) = sortTokens(tokenA, tokenB);
        // pair = address(
        //     uint160(
        //         uint256(
        //             keccak256(
        //                 abi.encodePacked(
        //                     bytes1(0xff),
        //                     factory,
        //                     keccak256(abi.encodePacked(token0, token1)),
        //                     hex"443533a897cfad2762695078bf6ee9b78b4edcda64ec31e1c83066cee4c90a7e" // init code hash
        //                 )
        //             )
        //         )
        //     )
        // );
        pair = ICyfherFactory(factory).getPair(tokenA, tokenB);
    }

    // fetches and sorts the reserves for a pair
    function getReserves(
        address factory,
        address tokenA,
        address tokenB
    ) internal view returns (euint32 reserveA, euint32 reserveB) {
        (address token0, ) = sortTokens(tokenA, tokenB);
        (euint32 reserve0, euint32 reserve1, ) = ICyfherPair(
            pairFor(factory, tokenA, tokenB)
        ).getReserves();
        // Handle the sorting of tokens by their hexadecimal address in the pair contract
        ebool tokenAEqToken0 = FHE.eq(
            FHE.asEaddress(tokenA),
            FHE.asEaddress(token0)
        );
        reserveA = FHE.select(tokenAEqToken0, reserve0, reserve1);
        reserveB = FHE.select(tokenAEqToken0, reserve1, reserve0);
    }

    // given some amount of an asset and pair reserves, returns an equivalent amount of the other asset
    function quote(
        euint32 amountA,
        euint32 reserveA,
        euint32 reserveB
    ) internal pure returns (euint32 amountB) {
        FHE.req(FHE.gt(amountA, FHE.asEuint32(0)));
        FHE.req(FHE.gt(reserveA, FHE.asEuint32(0)));
        FHE.req(FHE.gt(reserveB, FHE.asEuint32(0)));
        amountB = FHE.div(FHE.mul(amountA, reserveB), reserveA);
    }

    // given an input amount of an asset and pair reserves, returns the maximum output amount of the other asset
    function getAmountOut(
        address factory,
        euint32 amountIn,
        address[] memory path
    ) internal view returns (euint32 amountOut) {
        //FHE.req(FHE.gt(amountIn, FHE.asEuint32(0)));
        // Imported from getAmountsOut function
        (euint32 reserveIn, euint32 reserveOut) = getReserves(
            factory,
            path[0],
            path[1]
        );
        /*         FHE.req(
            FHE.and(
                FHE.gte(reserveIn, FHE.asEuint32(0)),
                FHE.gte(reserveOut, FHE.asEuint32(0))
            )
        ); */
        //    euint32 amountInWithFee = FHE.mul(amountIn, FHE.asEuint32(997));
        euint32 numerator = FHE.mul(amountIn, reserveOut);
        euint32 denominator = FHE.add(
            reserveIn, //FHE.mul(reserveIn, FHE.asEuint32(1000)),
            amountIn
        );
        amountOut = FHE.div(numerator, denominator);
    }

    // // given an output amount of an asset and pair reserves, returns a required input amount of the other asset
    function getAmountIn(
        euint32 amountOut,
        euint32 reserveIn,
        euint32 reserveOut
    ) internal pure returns (euint32 amountIn) {
        FHE.req(FHE.gt(amountOut, FHE.asEuint32(0)));
        FHE.req(
            FHE.and(
                FHE.gt(reserveIn, FHE.asEuint32(0)),
                FHE.gt(reserveOut, FHE.asEuint32(0))
            )
        );

        // WARNING: this can overflow
        euint32 numerator = FHE.mul(
            reserveIn,
            FHE.mul(amountOut, FHE.asEuint32(1000))
        );
        euint32 denominator = FHE.mul(
            FHE.sub(reserveOut, amountOut),
            FHE.asEuint32(997)
        );
        amountIn = FHE.add(FHE.div(numerator, denominator), FHE.asEuint32(1));
    }

    function Esqrt(euint32 x) internal pure returns (euint32) {
        ebool isZeroValue = FHE.eq(x, FHE.asEuint32(0));
        euint32 x_safe = FHE.select(isZeroValue, FHE.asEuint32(1), x);

        euint32 xx = x_safe;
        euint32 r = FHE.asEuint32(1);

        ebool compare1 = FHE.gte(xx, FHE.asEuint32(0x10000));
        xx = FHE.select(compare1, FHE.shr(x_safe, FHE.asEuint32(16)), xx);
        r = FHE.select(compare1, FHE.shl(r, FHE.asEuint32(8)), r);

        ebool compare2 = FHE.gte(xx, FHE.asEuint32(0x100));
        xx = FHE.select(compare2, FHE.shr(xx, FHE.asEuint32(8)), xx);
        r = FHE.select(compare2, FHE.shl(r, FHE.asEuint32(4)), r);

        ebool compare3 = FHE.gte(xx, FHE.asEuint32(0x10));
        xx = FHE.select(compare3, FHE.shr(xx, FHE.asEuint32(4)), xx);
        r = FHE.select(compare3, FHE.shl(r, FHE.asEuint32(2)), r);

        ebool compare4 = FHE.gte(xx, FHE.asEuint32(0x8));
        r = FHE.select(compare4, FHE.shl(r, FHE.asEuint32(1)), r);

        r = FHE.shr(FHE.add(r, FHE.div(x_safe, r)), FHE.asEuint32(1));
        r = FHE.shr(FHE.add(r, FHE.div(x_safe, r)), FHE.asEuint32(1));
        r = FHE.shr(FHE.add(r, FHE.div(x_safe, r)), FHE.asEuint32(1));

        euint32 r1 = FHE.div(x_safe, r);
        ebool compare = FHE.lt(r, r1);
        r = FHE.select(compare, r, r1);

        r = FHE.select(isZeroValue, FHE.asEuint32(0), r);

        return r;
    }

    /// @dev will not be implemented: Multipath token won't be calculated because of for loop that can easily run out of gas
    // // performs chained getAmountOut calculations on any number of pairs
    // function getAmountsOut(
    //     address factory,
    //     uint256 amountIn,
    //     address[] memory path
    // ) internal view returns (uint256[] memory amounts) {
    //     require(path.length >= 2, "UniswapV2Library: INVALID_PATH");
    //     amounts = new uint256[](path.length);
    //     amounts[0] = amountIn;
    //     for (uint256 i; i < path.length - 1; i++) {
    //         (uint256 reserveIn, uint256 reserveOut) = getReserves(factory, path[i], path[i + 1]);
    //         amounts[i + 1] = getAmountOut(amounts[i], reserveIn, reserveOut);
    //     }
    // }

    // // performs chained getAmountIn calculations on any number of pairs
    // function getAmountsIn(
    //     address factory,
    //     uint256 amountOut,
    //     address[] memory path
    // ) internal view returns (uint256[] memory amounts) {
    //     require(path.length >= 2, "UniswapV2Library: INVALID_PATH");
    //     amounts = new uint256[](path.length);
    //     amounts[amounts.length - 1] = amountOut;
    //     for (uint256 i = path.length - 1; i > 0; i--) {
    //         (uint256 reserveIn, uint256 reserveOut) = getReserves(factory, path[i - 1], path[i]);
    //         amounts[i - 1] = getAmountIn(amounts[i], reserveIn, reserveOut);
    //     }
    // }
}
