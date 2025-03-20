# CyFHEr-swap

> A **confidential Automated Market Maker** based on Uniswap V2, deployed on the Fhenix Nitrogen testnet, enabling fully **end-to-end encrypted swaps**.

## Installation and Usage

### Smart Contracts

#### Installation
```sh
npm install
```

#### Testing
Start the Fhenix local node:
```sh
npm run localfhenix:start
```
Run tests using the Fhenix local node:
```sh
npm run test
```
Or run tests with mocked FHE on Hardhat:
```sh
npm run test:hardhat
```

#### Deployment
1. Deploy tokens and the token distributor:
   ```sh
   npm run deploy:tokens
   ```
2. Make the token distributor the owner of the tokens (execute for all three tokens):
   ```sh
   npm run task:transferOwnership -- 'TOKEN_DISTRIBUTOR_ADDRESS' 'TOKEN_ADDRESS'
   ```
3. Deploy the AMM:
   ```sh
   npm run deploy:amm
   ```

### Frontend
#### Installation
```sh
npm install
```

#### Running the Frontend
On Windows:
```sh
npm start
```
On non-Windows machines, remove `set PORT=5000 &&` from `package.json` before running:
```sh
npm start
```

#### Configuring Contracts
Copy the deployed contract addresses into `contracts/constants.js` before using the frontend

## Project history

For years, at Blockchain Partner by KPMG, we have guided clients in exploring blockchain and crypto assets related innovations. Among the key concerns consistently raised in our research and advisory work, **data confidentiality** has always been on the tops, especially for **financial institutions** and **corporate** clients.

Our first approach to confidentiality, many years ago, involved **private and consortium blockchains**, where access and data visibility were restricted to a predefined group of participants. While these architectures provided control over sensitive information, they inherently limited the openness and decentralization that define public blockchains.

To push confidentiality further while maintaining public blockchain benefits, we explored **zero-knowledge proofs** (ZKPs). These allowed on-chain verification of private data without revealing the data itself. We experimented with ZKPs mainly for on-chain identity but are keeping an eye on experimental ZK-rollup focused on privacy (e.g; Aztec).

Later, we explored **validium-based layer 2**, where transaction data was kept off-chain for selected participants of a Data Availability Committee (DAC), while zero-knowledge proofs of transaction batches were posted and verified on Ethereum. While effecting in restricting data access, this approach often resulted in siloed network, limiting broader interoperability.

Over the past year, we turned our attention to a different way of **bringing confidentiality to public blockchain** : **Fully Homomorphic Encryption (FHE)**. FHE enables computation to be performed directly on encrypted data without ever decrypting it.

Thanks to **Zama’s fhEVM**, this breakthrough found its way into blockchain and DeFi, providing an alternative approach to private state and computations in smart contracts.

Inspired by this, we envisioned an **Automated Market Maket (AMM)**, where users could swap tokens in a trustless manner while keeping trade amounts confidential.

Our goal was to build on the foundation of **Uniswap V2**, the most widely used AMM protocol, with over 1.5 billion in Total Value Locked (TVL), while simplifying its mechanics to align with the constraints of fhEVM technology.

## Technical analysis

Within our AMM smart contracts, we aimed to **encrypt as much information as possible** to prevent external observers from inferring trade details. As a result, key trade parameters such as **trade size, trade direction, liquidity pool reserves and LP token balances** are all encrypted.

To ensure maximum confidentiality, the AMM requires both trading assets to be confidential ERC20s. These can either be natively issued confidential tokens or wrapped versions of standard ERC20 tokens from the Ethereum ecosystem.

Our AMM retains core functionalities expected from a decentralized exchange, including permissionless liquidity provision and removal, as well as swaps on both sides of the pool, with liquidity providers earning swap fees.

For deployment, we chose **Fhenix Nitrogen testnet**, an Ethereum layer 2 specializing in privacy by leveraging Zama’s fhEVM technology. Our decision was primarily driven by two factors:

-   **Higher gas limit per block** (50 million), allowing for more complex computations and transactions par second.
-   **Expanded support for mathematical operations**, enabling more computations (e.g; division of an encrypted integer by another encrypted integer).

However, Fhenix achieves these enhancement by locally decrypting certain variables to perform operations, which **introduces privacy drawback**. An alternative approach would have been to deploy on Sepolia testnet with Zama’s fhEVM coprocessor, but this would have introduced other trade-offs in privacy and efficiency for our specific use case.

Ultimately, since Fhenix is built on Zama’s fhEVM, our AMM contracts remain **highly portable**. With minimal modifications (mainly syntax and ACL rules), they could be deployed on Sepolia testnet with Zama’s coprocessor.

## Technical limits

This section explores the **key limitations** encountered in our confidential AMM implementation. Overcoming these challenges is critical to achieve a higher level of production readiness.

### Privacy limits

Despite strong encryption within the AMM, **full confidentiality of trade actions is not yet achieved**. Indeed, as detailed in [this research paper](https://arxiv.org/pdf/2103.01193), encrypting liquidity pool reserves, LP token balances, trade size and direction alone is insufficient to fully obfuscate trade details in a simple Constant Function Market Maker (CFMM) such as Uniswap V2.

The main issue arises from **price slippage**: an external observer can monitor the quoted price ratio of an asset before and after a trade occurs. Since AMMs inherently adjust prices based on past executed trades, **price fluctuations leak information** about the size and direction of individual trades, even if the liquidity pool reserves remain encrypted.

This means that while trade details would not be directly observable on-chain via a block explorer, an advanced user could still infer trade execution information through automated tools, reducing the system’s effective privacy.

Several mitigation strategies could be explored:

-   **Batching trades**: if multiple trades are executed simultaneously within a single transaction batch or within a single block, the individual impact of each trade on the price becomes harder to distinguish. This issue being that this approach would introduce latency in trade execution and may increase slippage for individual users.
-   **Restricting access to the quoted price**:
    -   _Rate-limiting price updates_: enforcing a delay in price updates (e.g., one price refresh every 20 minutes) would reduce real-time monitoring of the pool but would increase slippage and inefficiency price for the end-user.
    -   _Access control on price queries_: making the quoted price accessible only through authentication could restrict external analysis. For instance, quoted price could be accessible only with a cryptographic signature provided by the application’s frontend. However, this would require another blockchain transaction to get the quoted price and would degrade the user experience and worsen the composability with other decentralized applications.
-   **Adding noise to the quoted price**: introducing random noise in price calculation could obfuscate small trade impacts. However, this compromises price accuracy and leads to worse execution for traders.
-   **Exploring alternative AMM models**: the constant product formula used in Uniswap V2 inherently leaks information via price movements. More complex AMM formulas could introduce additional obfuscation while maintaining competitive price execution.

As we have seen above, each of these mitigation strategies comes with **clear trade-offs** between privacy, execution efficiency and user experience. The key challenge would be to determine the optimal balance for preserving fast, efficient, and predictable execution for users.

### Development limits

Having closely followed the evolution of Zama’s FHE technology for over a year, we recognize the rapid pace of development. As of now, fhEVM is at version v0.6.2, and the fhEVM coprocessor was deployed on Sepolia in December 2024. The throughput of encrypted operations per second **continues to increase exponentially with hardware acceleration**, making more complex use cases progressively viable.

However, in our assessment, the technology is not yet production-ready, both in terms of the FHE virtual machine and the development environment.

One of the main challenges lies in **computational efficiency**. FHE gas costs scale linearly with bit size, meaning that arithmetic operations on numbers with high decimal precision (which is often the case for crypto tokens) become quickly expensive.

Additionally, certain operations that are fundamental to traditional software development, such as **loops (for/while), square root calculations, and complex branching logic**, remain difficult to implement without significant overhead. The high computational cost of encrypted operations also results in gas consumption escalating rapidly, making it easy **to hit block size limits**. As a result, developers must find creative workarounds, optimizing algorithms and data structures to minimize these constraints.

Beyond the computational limits, the **development environment** itself still lacks the maturity seen in traditional Solidity toolchain. This was especially the case with Hardhat and Foundry integration for Fhenix virtual machine, often lacking native functionalities or requiring workaround to make the development process easier.

Despite these challenges, Zama’s documentation is extensive, and their team remains highly responsive.

## Conclusion

Fully Homomorphic Encryption (FHE) establishes a **strong foundation for bringing native privacy to on-chain computation**, but simply converting existing smart contract architectures to FHE is not a seamless solution. Traditional DeFi designs do not inherently account for encrypted execution and privacy conservation, meaning additional protocol-level modifications and privacy-preserving mechanisms are necessary to fully mitigate information leakage.

Beyond architectural adjustments, performance optimizations at the FHE computation level remain critical. Current **constraints on gas costs, encrypted arithmetic, and execution efficiency limit the feasibility** of handling a high number of transactions per second. To support scalable, production-ready confidential applications, the **underlying cryptographic primitives** must continue evolving, enabling not only better throughput but also more complex operations without excessive computational overhead.

> [!CAUTION]
> DISCLAIMER : This code is for experimental purposes only and is not suitable for production. Certain Uniswap V2 safeguards have been removed, and the implementation may contain bugs, overflows, or underflows. Use at your own risk.
