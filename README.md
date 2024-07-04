# Solana dApp

This project is generated with the [create-solana-dapp](https://github.com/solana-developers/create-solana-dapp) generator.

## Getting Started

### Prerequisites

- Node v18.18.0 or higher

- Rust v1.77.2 or higher
- Anchor CLI 0.30.0 or higher
- Solana CLI 1.18.9 or higher

### Installation

#### Clone the repo

```shell
git clone <repo-url>
cd <repo-name>
```

#### Install Dependencies

```shell
npm install
```

## Apps

### anchor

This is a Solana program written in Rust using the Anchor framework.

#### Commands

```
cd anchor
```

```
anchor keys list
```

After this command take the key and change the `declare_id!` value on `lib.rs` file 

Then use these commands
 
```
anchor clean
```

```
anchor keys sync
```

```
anchor build
```

After these commands need to deploy the contract

#### Deploy to Localnet

```shell
anchor deploy --provider.cluster localnet
```

#### Deploy to Devnet

```shell
anchor deploy --provider.cluster devnet
```


### web

This is a React app that uses the Anchor generated client to interact with the Solana program.

#### Commands

Start the web app

```shell
npm run dev
```
