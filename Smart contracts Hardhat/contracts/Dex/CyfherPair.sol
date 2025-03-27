// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {ICyfherFactory} from "../interfaces/ICyfherFactory.sol";
import {ICyfherPair} from "../interfaces/ICyfherPair.sol";
import {IPFHERC20} from "../interfaces/IPFHERC20.sol";
import {PFHERC20} from "../tokens/PFHERC20.sol";
import {CyfherSwapLibrary} from "../libraries/CyfherSwapLibrary.sol";
import {Permissioned, Permission} from "@fhenixprotocol/contracts/access/Permissioned.sol";
import "@fhenixprotocol/contracts/FHE.sol";

contract CyfherPair is PFHERC20 {
    euint32 public MINIMUM_LIQUIDITY = FHE.asEuint32(1);

    address public factory;
    address public token0;
    address public token1;
    euint32 private reserve0 = FHE.asEuint32(0);
    euint32 private reserve1 = FHE.asEuint32(0);
    uint32 private blockTimestampLast;

    uint private unlocked = 1;

    modifier lock() {
        require(unlocked == 1, "CyfherSwap: LOCKED");
        unlocked = 0;
        _;
        unlocked = 1;
    }

    constructor() PFHERC20("CyfherERC20", "Cyf", 2) {
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
    function _update(euint32 balance0, euint32 balance1) private {
        uint32 blockTimestamp = uint32(block.timestamp % 2 ** 32);
        reserve0 = balance0;
        reserve1 = balance1;
        blockTimestampLast = blockTimestamp;
    }

    // this low-level function should be called from a contract which performs important safety checks
    function mint(address to) external lock returns (euint32 liquidity) {
        (euint32 _reserve0, euint32 _reserve1, ) = getReserves(); // gas savings
        // use get balance unsafe function until eip 1272 is implemented or permissionV2 is released
        euint32 balance0 = IPFHERC20(token0).unsafeBalanceOf(address(this));
        euint32 balance1 = IPFHERC20(token1).unsafeBalanceOf(address(this));
        euint32 amount0 = FHE.sub(balance0, _reserve0);
        euint32 amount1 = FHE.sub(balance1, _reserve1);
        ebool totalSupplyIsZeroEncrypted = FHE.eq(
            _totalSupply,
            FHE.asEuint32(0)
        );

        // decrypting if totalsupply is 0 or not  does not reveal any sensetive information ,doing if else statement will save gas
        bool totalSupplyIsZero = FHE.decrypt(totalSupplyIsZeroEncrypted);
        if (totalSupplyIsZero) {
            // transferfrom function is unsafe as it does not check if the user has approved the token
            // need to add check if the user has approved the token
            bool isAmountZero1 = FHE.decrypt(FHE.eq(amount0, FHE.asEuint32(0)));
            bool isAmountZero2 = FHE.decrypt(FHE.eq(amount1, FHE.asEuint32(0)));

            require(
                !isAmountZero1 && !isAmountZero2,
                "CyfherSwap: Not enough tokens Approved"
            );
            // this can underflow if the user has aproved tokens but has not enough balance
            //this easily overflows
            euint32 square = FHE.mul(amount0, amount1);
            euint32 squareroot = CyfherSwapLibrary.Esqrt(square);
            liquidity = FHE.sub(squareroot, MINIMUM_LIQUIDITY);
            _mint(address(0), MINIMUM_LIQUIDITY); // permanently lock the first MINIMUM_LIQUIDITY tokens
        } else {
            euint32 liquidity1 = FHE.div(
                FHE.mul(amount0, _totalSupply),
                _reserve0
            );
            euint32 liquidity2 = FHE.div(
                FHE.mul(amount1, _totalSupply),
                _reserve1
            );
            liquidity = FHE.min(liquidity1, liquidity2);
        }
        FHE.req(FHE.gt(liquidity, FHE.asEuint32(0)));

        _mint(to, liquidity);
        _update(balance0, balance1);
    }

    function burn(
        address to
    ) external lock returns (euint32 amount0, euint32 amount1) {
        address _token0 = token0;
        address _token1 = token1; // gas savings
        euint32 balance0 = IPFHERC20(_token0).unsafeBalanceOf(address(this));
        euint32 balance1 = IPFHERC20(_token1).unsafeBalanceOf(address(this));
        euint32 liquidity = _balances[address(this)];
        amount0 = FHE.div(FHE.mul(liquidity, balance0), _totalSupply); // using balances ensures pro-rata
        amount1 = FHE.div(FHE.mul(liquidity, balance1), _totalSupply); // using balances ensures pro-rata
        _burn(address(this), liquidity);
        IPFHERC20(address(_token0))._transfer(amount0, to);
        IPFHERC20(address(_token1))._transfer(amount1, to);
        balance0 = IPFHERC20(_token0).unsafeBalanceOf(address(this));
        balance1 = IPFHERC20(_token1).unsafeBalanceOf(address(this));
        _update(balance0, balance1);
    }

    function swap(
        euint32 amount0Out,
        euint32 amount1Out,
        address to
    ) external lock {
        //(euint32 _reserve0, euint32 _reserve1, ) = getReserves(); // gas savings
        euint32 balance0;
        euint32 balance1;

        // scope for _token{0,1}, avoids stack too deep errors
        address _token0 = token0;
        address _token1 = token1;
        IPFHERC20(_token0)._transfer(amount0Out, to);
        IPFHERC20(_token1)._transfer(amount1Out, to);
        balance0 = IPFHERC20(_token0).unsafeBalanceOf(address(this));
        balance1 = IPFHERC20(_token1).unsafeBalanceOf(address(this));
        // POTENTIAL OVERFLOW RISK
        /*         ebool balance0GtReserve0MinusAmount0Out = FHE.gt(
            balance0,
            FHE.sub(_reserve0, amount0Out)
        );
        ebool balance1GtReserve1MinusAmount1Out = FHE.gt(
            balance1,
            FHE.sub(_reserve1, amount1Out)
        );
        euint32 amount0In = FHE.select(
            balance0GtReserve0MinusAmount0Out,
            FHE.sub(balance0, FHE.sub(_reserve0, amount0Out)),
            FHE.asEuint32(0)
        );
        euint32 amount1In = FHE.select(
            balance1GtReserve1MinusAmount1Out,
            FHE.sub(balance1, FHE.sub(_reserve1, amount1Out)),
            FHE.asEuint32(0)
        );
        {
            // scope for reserve{0,1}Adjusted, avoids stack too deep errors
            euint32 balance0Adjusted = FHE.sub(
                FHE.mul(balance0, FHE.asEuint32(1000)),
                FHE.mul(amount0In, FHE.asEuint32(3))
            );
            euint32 balance1Adjusted = FHE.sub(
                FHE.mul(balance1, FHE.asEuint32(1000)),
                FHE.mul(amount1In, FHE.asEuint32(3))
            );
            // Here we check newK > oldK
            // BE CAREFUL, WE SHOULD REMOVE THIS CHECK AS IT MAY OVERFLOW VERY EASILY
            FHE.req(
                FHE.gte(
                    FHE.mul(balance0Adjusted, balance1Adjusted),
                    FHE.mul(FHE.mul(_reserve0, _reserve1), FHE.asEuint32(1e6))
                )
            );
        } */

        _update(balance0, balance1);
    }
}
