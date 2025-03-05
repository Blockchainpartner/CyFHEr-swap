// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "@fhenixprotocol/contracts/FHE.sol";

interface ICyfherPair {
    function name() external pure returns (string memory);
    function symbol() external pure returns (string memory);
    function decimals() external pure returns (uint8);
    function totalSupply() external view returns (uint);
    function balanceOf(address owner) external view returns (uint);
    function allowance(
        address owner,
        address spender
    ) external view returns (uint);

    function approve(address spender, uint value) external returns (bool);
    function transfer(address to, uint value) external returns (bool);
    function transferFrom(
        address from,
        address to,
        uint value
    ) external returns (bool);

    function DOMAIN_SEPARATOR() external view returns (bytes32);
    function PERMIT_TYPEHASH() external pure returns (bytes32);
    function nonces(address owner) external view returns (uint);

    function permit(
        address owner,
        address spender,
        uint value,
        uint deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function MINIMUM_LIQUIDITY() external view returns (euint32);

    function factory() external view returns (address);

    function token0() external view returns (address);

    function token1() external view returns (address);

    function getReserves()
        external
        view
        returns (euint32 reserve0, euint32 reserve1, uint32 blockTimestampLast);

    //function price0CumulativeLast() external view returns (uint);

    //function price1CumulativeLast() external view returns (uint);

    //function kLast() external view returns (uint);
    function burn(
        address to
    ) external returns (euint32 amount0, euint32 amount1);
    function mint(address to) external returns (euint32 liquidity);
    function swap(euint32 amount0Out, euint32 amount1Out, address to) external;

    // function skim(address to) external;
    // function sync() external;

    function initialize(address, address) external;
}
