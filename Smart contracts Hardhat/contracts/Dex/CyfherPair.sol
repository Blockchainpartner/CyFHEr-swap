// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {ICyfherFactory} from "../interfaces/ICyfherFactory.sol";
import {ICyfherPair} from "../interfaces/ICyfherPair.sol";
import {ICyfherERC20} from "../interfaces/ICyfherERC20.sol";

import {Permissioned, Permission} from "@fhenixprotocol/contracts/access/Permissioned.sol";
import "@fhenixprotocol/contracts/FHE.sol";

import {CyfherERC20} from "./CyfherERC20.sol";

import "@fhenixprotocol/contracts/utils/debug/Console.sol";

contract CyfherPair is CyfherERC20 {
    //using UQ112x112 for uint224;

    //uint public constant MINIMUM_LIQUIDITY = 10 ** 3;
    euint32 public MINIMUM_LIQUIDITY = FHE.asEuint32(1);

    //bytes4 private constant SELECTOR = bytes4(keccak256(bytes("transfer(address,uint256)")));

    address public factory;
    address public token0;
    address public token1;

    euint32 private reserve0 = FHE.asEuint32(0); // uses single storage slot, accessible via getReserves
    euint32 private reserve1 = FHE.asEuint32(0); // uses single storage slot, accessible via getReserves
    uint32 private blockTimestampLast; // uses single storage slot, accessible via getReserves

    //euint32 public price0CumulativeLast;
    // euint32 public price1CumulativeLast;
    // euint32 public kLast; // reserve0 * reserve1, as of immediately after the most recent liquidity event

    uint private unlocked = 1;

    modifier lock() {
        require(unlocked == 1, "CyfherSwap: LOCKED");
        unlocked = 0;
        _;
        unlocked = 1;
    }

    constructor() {
        factory = msg.sender;
    }

    // called once by the factory at time of deployment
    function initialize(address _token0, address _token1) external {
        require(msg.sender == factory, "CyfherSwap: FORBIDDEN"); // sufficient check
        token0 = _token0;
        token1 = _token1;
    }
    function getReserves()
        public
        view
        returns (
            euint32 _reserve0,
            euint32 _reserve1,
            uint32 _blockTimestampLast
        )
    {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
        _blockTimestampLast = blockTimestampLast;
    }

    // update reserves and, on the first call per block, price accumulators
    function _update(
        euint32 balance0,
        euint32 balance1,
        euint32 _reserve0,
        euint32 _reserve1
    ) private {
        // require(balance0 <= type(uint112).max && balance1 <= type(uint112).max, "UniswapV2: OVERFLOW");
        uint32 blockTimestamp = uint32(block.timestamp % 2 ** 32);
        // unchecked {
        //     uint32 timeElapsed = blockTimestamp - blockTimestampLast; // overflow is desired
        //     if (timeElapsed > 0 && _reserve0 != 0 && _reserve1 != 0) {
        //         // * never overflows, and + overflow is desired
        //         price0CumulativeLast += uint256(UQ112x112.encode(_reserve1).uqdiv(_reserve0)) * timeElapsed;
        //         price1CumulativeLast += uint256(UQ112x112.encode(_reserve0).uqdiv(_reserve1)) * timeElapsed;
        //     }
        // }
        // reserve0 = uint112(balance0);
        // reserve1 = uint112(balance1);
        // blockTimestampLast = blockTimestamp;
        // emit Sync(reserve0, reserve1);
        reserve0 = balance0;
        reserve1 = balance1;
        blockTimestampLast = blockTimestamp;
    }

    // this low-level function should be called from a contract which performs important safety checks
    function mint(address to) external lock returns (euint32 liquidity) {
        (euint32 _reserve0, euint32 _reserve1, ) = getReserves(); // gas savings
        // make a get balance unsafe function until i implement eip 1272

        euint32 balance0 = CyfherERC20(token0).unsafeBalanceOf(address(this));
        euint32 balance1 = ICyfherERC20(token1).unsafeBalanceOf(address(this));
        euint32 amount0 = FHE.sub(balance0, _reserve0);
        euint32 amount1 = FHE.sub(balance1, _reserve1);
        // bool feeOn = _mintFee(_reserve0, _reserve1);
        euint32 totalSupply = _totalSupply; // gas savings, must be defined here since totalSupply can update in _mintFee
        ebool totalSupplyIsZeroEncrypted = FHE.eq(
            totalSupply,
            FHE.asEuint32(0)
        );
        // decrypting if totalsupply is 0 or not  does not reveal any sensetive information ,doing if else statement will save gas
        bool totalSupplyIsZero = FHE.decrypt(totalSupplyIsZeroEncrypted);
        if (totalSupplyIsZero) {
            _mint(address(0), MINIMUM_LIQUIDITY); // permanently lock the first MINIMUM_LIQUIDITY tokens
            // we should use square root here
            // Edge case if amount 0 and amount 1 are 0 when adding liquidity this will revert or underflow
            liquidity = (amount0 * amount1) - MINIMUM_LIQUIDITY;
            //Console.log(FHE.decrypt(liquidity));
        } else {
            liquidity = FHE.min(
                (amount0 * _totalSupply) / _reserve0,
                (amount1 * _totalSupply) / _reserve1
            );
        }
        FHE.req(liquidity.gt(FHE.asEuint32(0)));
        _mint(to, liquidity);
        _update(balance0, balance1, _reserve0, _reserve1);
    }

    // if (feeOn) kLast = uint256(reserve0) * reserve1; // reserve0 and reserve1 are up-to-date
    // emit Mint(msg.sender, amount0, amount1);
}
