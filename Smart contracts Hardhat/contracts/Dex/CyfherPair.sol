// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {ICyfherFactory} from "../interfaces/ICyfherFactory.sol";
import {ICyfherPair} from "../interfaces/ICyfherPair.sol";
import {IPFHERC20} from "../interfaces/IPFHERC20.sol";
import {PFHERC20} from "../tokens/PFHERC20.sol";
import {CyfherSwapLibrary} from "../libraries/CyfherSwapLibrary.sol";
import {Permissioned, Permission} from "@fhenixprotocol/contracts/access/Permissioned.sol";
import "@fhenixprotocol/contracts/FHE.sol";
import "@fhenixprotocol/contracts/utils/debug/Console.sol";

contract CyfherPair is PFHERC20 {
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

    constructor() PFHERC20("CyfherERC20", "Cyf", 3) {
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
        uint32 blockTimestamp = uint32(block.timestamp % 2 ** 32);
        reserve0 = balance0;
        reserve1 = balance1;
        blockTimestampLast = blockTimestamp;
    }

    // this low-level function should be called from a contract which performs important safety checks
    function mint(address to) external lock returns (euint32 liquidity) {
        (euint32 _reserve0, euint32 _reserve1, ) = getReserves(); // gas savings
        // make a get balance unsafe function until i implement eip 1272
        euint32 balance0 = IPFHERC20(token0).unsafeBalanceOf(address(this));
        euint32 balance1 = IPFHERC20(token1).unsafeBalanceOf(address(this));
        euint32 amount0 = FHE.sub(balance0, _reserve0);
        euint32 amount1 = FHE.sub(balance1, _reserve1);
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
            // we assume that the user will add same amount of token0 and token1
            liquidity = amount0 - MINIMUM_LIQUIDITY;
            Console.log(FHE.decrypt(liquidity));
        } else {
            liquidity = FHE.min(
                (amount0 * _totalSupply) / _reserve0,
                (amount1 * _totalSupply) / _reserve1
            );
        }
        // FHE.req(liquidity.gt(FHE.asEuint32(0)));
        _mint(to, liquidity);
        _update(balance0, balance1, _reserve0, _reserve1);
    }

    // // this low-level function should be called from a contract which performs important safety checks
    function burn(
        address to
    ) external lock returns (euint32 amount0, euint32 amount1) {
        (euint32 _reserve0, euint32 _reserve1, ) = getReserves(); // gas savings
        address _token0 = token0; // gas savings
        address _token1 = token1; // gas savings
        euint32 balance0 = IPFHERC20(_token0).unsafeBalanceOf(address(this));
        euint32 balance1 = IPFHERC20(_token1).unsafeBalanceOf(address(this));
        euint32 liquidity = _balances[address(this)];

        // bool feeOn = _mintFee(_reserve0, _reserve1);
        // uint256 _totalSupply = totalSupply; // gas savings, must be defined here since totalSupply can update in
        // _mintFee
        amount0 = FHE.div(FHE.mul(liquidity, balance0), _totalSupply); // using balances ensures pro-rata
        // distribution
        amount1 = FHE.div(FHE.mul(liquidity, balance1), _totalSupply); // using balances ensures pro-rata
        // distribution
        // require(amount0 > 0 && amount1 > 0, "UniswapV2: INSUFFICIENT_LIQUIDITY_BURNED");
        _burn(address(this), liquidity);
        IPFHERC20(address(_token0))._transfer(amount0, to);
        // _safeTransfer(_token1, to, amount1);
        IPFHERC20(address(_token1))._transfer(amount1, to);
        balance0 = IPFHERC20(_token0).unsafeBalanceOf(address(this));
        balance1 = IPFHERC20(_token1).unsafeBalanceOf(address(this));

        _update(balance0, balance1, _reserve0, _reserve1);
        // if (feeOn) kLast = uint256(reserve0) * reserve1; // reserve0 and reserve1 are up-to-date
        // emit Burn(msg.sender, amount0, amount1, to);
    }

    // this low-level function should be called from a contract which performs important safety checks
    function swap(
        euint32 amount0Out,
        euint32 amount1Out,
        address to
    ) external lock {
        //require(amount0Out > 0 || amount1Out > 0, "UniswapV2: INSUFFICIENT_OUTPUT_AMOUNT");
        (euint32 _reserve0, euint32 _reserve1, ) = getReserves(); // gas savings
        //require(amount0Out < _reserve0 && amount1Out < _reserve1, "UniswapV2: INSUFFICIENT_LIQUIDITY");

        euint32 balance0;
        euint32 balance1;
        {
            // scope for _token{0,1}, avoids stack too deep errors
            address _token0 = token0;
            // console.log("Le token0 dans la Pair est %s", _token0);
            address _token1 = token1;
            //require(to != _token0 && to != _token1, "UniswapV2: INVALID_TO");
            //if (amount0Out > 0) _safeTransfer(_token0, to, amount0Out); // optimistically transfer tokens
            IPFHERC20(_token0)._transfer(amount0Out, to);
            //if (amount1Out > 0) _safeTransfer(_token1, to, amount1Out); // optimistically transfer tokens
            IPFHERC20(_token1)._transfer(amount1Out, to);
            // if (data.length > 0) IUniswapV2Callee(to).uniswapV2Call(msg.sender, amount0Out, amount1Out, data);
            balance0 = IPFHERC20(_token0).unsafeBalanceOf(address(this));
            balance1 = IPFHERC20(_token1).unsafeBalanceOf(address(this));
        }
        ebool balance0GtReserve0MinusAmount0Out = FHE.gt(
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
        Console.log("Amount0In : %s", FHE.decrypt(amount0In));
        euint32 amount1In = FHE.select(
            balance1GtReserve1MinusAmount1Out,
            FHE.sub(balance1, FHE.sub(_reserve1, amount1Out)),
            FHE.asEuint32(0)
        );
        Console.log("Amount1In : %s", FHE.decrypt(amount1In));
        Console.log("reserve0 : %s", FHE.decrypt(_reserve0));
        Console.log("reserve1 : %s", FHE.decrypt(_reserve1));

        // uint256 amount0In = balance0 > _reserve0 - amount0Out ? balance0 - (_reserve0 - amount0Out) : 0;
        // uint256 amount1In = balance1 > _reserve1 - amount1Out ? balance1 - (_reserve1 - amount1Out) : 0;
        // require(amount0In > 0 || amount1In > 0, "UniswapV2: INSUFFICIENT_INPUT_AMOUNT");
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
            Console.log("balance0adj : %s", FHE.decrypt(balance0Adjusted));
            Console.log("balance1adj : %s", FHE.decrypt(balance1Adjusted));

            Console.log(
                "new K: %s",
                FHE.decrypt(FHE.mul(balance0Adjusted, balance1Adjusted))
            );
            Console.log(
                "old K: %s",
                FHE.decrypt(
                    FHE.mul(FHE.mul(_reserve0, _reserve1), FHE.asEuint32(1e6))
                )
            );
            // Here we check newK > oldK
            // BE CAREFUL, WE SHOULD REMOVE THIS CHECK AS IT MAY OVERFLOW VERY EASILY
            FHE.req(
                FHE.gte(
                    FHE.mul(balance0Adjusted, balance1Adjusted),
                    FHE.mul(FHE.mul(_reserve0, _reserve1), FHE.asEuint32(1e6))
                )
            );
            //require(balance0Adjusted * balance1Adjusted >= uint256(_reserve0) * _reserve1 * 1e6, "UniswapV2: K");
        }

        _update(balance0, balance1, _reserve0, _reserve1);
        // emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }

    // if (feeOn) kLast = uint256(reserve0) * reserve1; // reserve0 and reserve1 are up-to-date
    // emit Mint(msg.sender, amount0, amount1);
}
