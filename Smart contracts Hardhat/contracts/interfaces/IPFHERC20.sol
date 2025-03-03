// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19 <0.9.0;

import {Permission} from "@fhenixprotocol/contracts/access/Permissioned.sol";
import "@fhenixprotocol/contracts/FHE.sol";

interface IPFHERC20 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (euint32);
    function balanceOf(
        address account,
        Permission memory permission
    ) external view returns (string memory);
    function allowance(
        address owner,
        address spender,
        Permission calldata permission
    ) external view returns (string memory);
    function approve(
        address spender,
        inEuint32 calldata value,
        Permission memory permission
    ) external returns (bool);
    function transfer(
        address to,
        inEuint32 calldata encryptedAmount,
        Permission memory permission
    ) external returns (euint32);
    function _transfer(
        euint32 encryptedAmount,
        address to
    ) external returns (euint32);
    function transferFrom(
        address from,
        address to,
        inEuint32 calldata value,
        Permission memory permission
    ) external returns (euint32);
    function mint(address to, inEuint32 calldata value) external;
    function burn(address from, inEuint32 memory encryptedAmount) external;
    function unsafeBalanceOf(address account) external view returns (euint32);
    function unsafe_transferFrom(
        address from,
        address to,
        euint32 value,
        Permission memory permission
    ) external returns (euint32);
}
