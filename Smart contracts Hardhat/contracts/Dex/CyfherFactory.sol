// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "../interfaces/ICyfherFactory.sol";
import "./CyfherPair.sol";

contract CyfherFactory is ICyfherFactory {
    address public feeTo;
    address public feeToSetter;

    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    constructor(address _feeToSetter) {
        feeToSetter = _feeToSetter;
    }

    function allPairsLength() external view returns (uint) {
        return allPairs.length;
    }

    function createPair(
        address tokenA,
        address tokenB
    ) external returns (address pair) {
        require(tokenA != tokenB, "CyfherSwap:IDENTICAL_ADDRESSES");
        (address token0, address token1) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);
        require(token0 != address(0), "CyfherSwap:ZERO_ADDRESS");
        require(
            getPair[token0][token1] == address(0),
            "CyfherSwap: PAIR_EXISTS"
        ); // single check is sufficient

        pair = address(
            new CyfherPair{salt: keccak256(abi.encodePacked(token0, token1))}()
        );

        CyfherPair(pair).initialize(token0, token1);
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair; // populate mapping in the reverse direction
        allPairs.push(pair);
        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    function setFeeTo(address _feeTo) external {
        require(msg.sender == feeToSetter, "CyfherSwap: FORBIDDEN");
        feeTo = _feeTo;
    }

    function setFeeToSetter(address _feeToSetter) external {
        require(msg.sender == feeToSetter, "CyfherSwap: FORBIDDEN");
        feeToSetter = _feeToSetter;
    }
}
