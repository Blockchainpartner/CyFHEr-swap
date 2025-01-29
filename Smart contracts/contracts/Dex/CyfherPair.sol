// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "../interfaces/ICyfherFactory.sol";
import "../interfaces/ICyfherPair.sol";
import "./CyfherERC20.sol";
import { SepoliaZamaFHEVMConfig } from "fhevm/config/ZamaFHEVMConfig.sol";

contract CyfherPair is SepoliaZamaFHEVMConfig, ICyfherPair, CyfherERC20 {
    //using UQ112x112 for uint224;

    uint public constant MINIMUM_LIQUIDITY = 10 ** 3;
    bytes4 private constant SELECTOR = bytes4(keccak256(bytes("transfer(address,uint256)")));

    address public factory;
    address public token0;
    address public token1;

    euint32 private reserve0; // uses single storage slot, accessible via getReserves
    euint32 private reserve1; // uses single storage slot, accessible via getReserves
    uint32 private blockTimestampLast; // uses single storage slot, accessible via getReserves

    euint64 public price0CumulativeLast;
    euint64 public price1CumulativeLast;
    euint public kLast; // reserve0 * reserve1, as of immediately after the most recent liquidity event

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
    function getReserves() public view returns (euint _reserve0, euint _reserve1, uint32 _blockTimestampLast) {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
        _blockTimestampLast = blockTimestampLast;
    }
}
