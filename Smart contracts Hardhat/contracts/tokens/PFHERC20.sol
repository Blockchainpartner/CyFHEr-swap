// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19 <0.9.0;

import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Permissioned, Permission} from "@fhenixprotocol/contracts/access/Permissioned.sol";
import "@fhenixprotocol/contracts/FHE.sol";

//TODO : make interfac later
//import {IFHERC20} from "./IFHERC20.sol";

contract PFHERC20 is Ownable2Step, Permissioned {
    // A mapping from address to an encrypted balance.
    mapping(address => euint32) internal _balances;

    // A mapping from address (owner) to a mapping of address (spender) to an encrypted amount.
    mapping(address => mapping(address => euint32)) internal _allowance;

    euint32 internal _totalSupply = FHE.asEuint32(0);

    string private _name;
    string private _symbol;
    uint8 private _decimals;

    error ErrorInsufficientFunds();
    error ERC20InvalidApprover(address);
    error ERC20InvalidSpender(address);
    error ERC20InvalidReceiver(address);

    /**
     * @dev Sets the values for {name} and {symbol}.
     *
     * All two of these values are immutable: they can only be set once during
     * construction.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) Ownable(msg.sender) {
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
    }
    /* @dev Returns the name of the token.
     */
    function name() public view virtual returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5.05` (`505 / 10 ** 2`).
     */
    function decimals() public view virtual returns (uint8) {
        return _decimals;
    }

    /**
     * @dev See {IERC20-totalSupply}.
     */

    //TODO : Encrypted variable accessed by everyone and needed for the pool
    // to overide for the pool token
    function totalSupply() public view virtual returns (euint32) {
        return _totalSupply;
    }

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(
        address account,
        Permission memory permission
    )
        public
        view
        virtual
        onlyPermitted(permission, account)
        returns (string memory)
    {
        return _balances[account].seal(permission.publicKey);
    }

    function allowance(
        address owner,
        address spender,
        Permission calldata permission
    )
        public
        view
        virtual
        onlyBetweenPermitted(permission, owner, spender)
        returns (string memory)
    {
        return FHE.sealoutput(_allowance[owner][spender], permission.publicKey);
    }

    function approve(
        address spender,
        inEuint32 calldata value,
        Permission memory permission
    ) public virtual onlyPermitted(permission, msg.sender) returns (bool) {
        _approve(msg.sender, spender, FHE.asEuint32(value));
        return true;
    }

    function _approve(address owner, address spender, euint32 value) internal {
        if (owner == address(0)) {
            revert ERC20InvalidApprover(address(0));
        }
        if (spender == address(0)) {
            revert ERC20InvalidSpender(address(0));
        }
        _allowance[owner][spender] = value;
    }

    function _spendAllowance(
        address owner,
        address spender,
        euint32 value
    ) internal virtual returns (euint32) {
        euint32 currentAllowance = _allowance[owner][spender];
        ebool isHigher = FHE.gte(currentAllowance, value);
        // FHEVM BUG :while Console.log the operation executed twice once with uint32.max/2 and then with the input value
        // this commented code below reverts the transaction

        /*Console.log("isHigher", FHE.decrypt(isHigher));
        require(
            FHE.decrypt(isHigher),
            "ERC20: transfer amount exceeds allowance"
        ); */
        euint32 spent = FHE.select(
            isHigher,
            currentAllowance,
            FHE.asEuint32(0)
        );
        _approve(owner, spender, (currentAllowance - spent));

        return spent;
    }

    function transferFrom(
        address from,
        address to,
        inEuint32 calldata value,
        Permission memory permission
    )
        public
        virtual
        onlyBetweenPermitted(permission, from, msg.sender)
        returns (euint32)
    {
        euint32 spent = _spendAllowance(from, msg.sender, FHE.asEuint32(value));
        return _transferImpl(from, to, spent);
    }

    function mint(address to, inEuint32 calldata value) public onlyOwner {
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        euint32 encryptedAmount = FHE.asEuint32(value);
        _mint(to, encryptedAmount);
    }

    function _mint(address to, euint32 value) internal {
        _balances[to] = _balances[to] + value;
        _totalSupply = _totalSupply + value;
    }
    // exclusive function for the token distributor
    function mint_distributor(address to, euint32 value) public onlyOwner {
        _balances[to] = _balances[to] + value;
        _totalSupply = _totalSupply + value;
    }

    function burn(
        address from,
        inEuint32 memory encryptedAmount
    ) public virtual onlyOwner {
        if (from == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        euint32 amount = FHE.asEuint32(encryptedAmount);
        _burn(from, amount);
    }
    function _burn(address from, euint32 encryptedAmount) internal {
        _transferImpl(from, address(0), encryptedAmount);
        // this can leak informations
        _totalSupply = _totalSupply - encryptedAmount;
    }

    function transfer(
        address to,
        inEuint32 calldata encryptedAmount,
        Permission memory permission
    ) external virtual onlyPermitted(permission, msg.sender) returns (euint32) {
        return _transferImpl(msg.sender, to, FHE.asEuint32(encryptedAmount));
    }
    function _transfer(
        euint32 value,
        address to
    ) external virtual returns (bool) {
        _transferImpl(msg.sender, to, value);
        return true;
    }

    // Transfers an encrypted amount.
    function _transferImpl(
        address from,
        address to,
        euint32 amount
    ) internal returns (euint32) {
        // Make sure the sender has enough tokens.
        euint32 amountToSend = FHE.select(
            amount.lte(_balances[from]),
            amount,
            FHE.asEuint32(0)
        );

        // Add to the balance of `to` and subract from the balance of `from`.
        _balances[to] = _balances[to] + amountToSend;
        _balances[from] = _balances[from] - amountToSend;
        // TODO : it has no sense to return an encrypted amount
        return amountToSend;
    }

    function unsafe_transferFrom(
        address from,
        address to,
        euint32 toTransfer,
        Permission memory permission
    )
        external
        virtual
        onlyBetweenPermitted(permission, from, msg.sender)
        returns (euint32)
    {
        euint32 spent = _spendAllowance(from, msg.sender, toTransfer);
        return _transferImpl(from, to, spent);
    }

    function unsafeBalanceOf(address account) public view returns (euint32) {
        return _balances[account];
    }
}
