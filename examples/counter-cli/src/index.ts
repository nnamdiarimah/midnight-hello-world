import { type CoinPublicKey, type ContractAddress, encodeCoinPublicKey } from '@midnight-ntwrk/compact-runtime';
import { Contract, ledger, witnesses } from '@midnight-ntwrk/counter-contract';
import { type CoinInfo, nativeToken, Transaction, type TransactionId } from '@midnight-ntwrk/ledger';
import { deployContract, findDeployedContract, withZswapWitnesses } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import {
  type BalancedTransaction,
  createBalancedTx,
  type MidnightProvider,
  type UnbalancedTransaction,
  type WalletProvider,
} from '@midnight-ntwrk/midnight-js-types';
import { type Resource, WalletBuilder } from '@midnight-ntwrk/wallet';
import { type Wallet } from '@midnight-ntwrk/wallet-api';
import { Transaction as ZswapTransaction } from '@midnight-ntwrk/zswap';
import * as crypto from 'crypto';
import { webcrypto } from 'crypto';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface, type Interface } from 'node:readline/promises';
import { type Logger } from 'pino';
import * as Rx from 'rxjs';
import { type DockerComposeEnvironment } from 'testcontainers';
import { WebSocket } from 'ws';
import {
  type MessageContract,
  type MessageProviders,
  type DeployedMessageContract,
  type PrivateStates,
} from './common-types.js';
import { type Config } from './config.js';
import { toHex } from './conversion-utils.js';
import { inMemoryPrivateStateProvider } from './in-memory-private-state-provider.js';

// @ts-expect-error: It's needed to make Scala.js and WASM code able to use cryptography
globalThis.crypto = webcrypto;

// @ts-expect-error: It's needed to enable WebSocket usage through apollo
globalThis.WebSocket = WebSocket;

export const getMessageLedgerState = (
  providers: MessageProviders,
  contractAddress: ContractAddress,
): Promise<string | null> =>
  providers.publicDataProvider
    .queryContractState(contractAddress)
    .then((contractState) => (contractState != null ? ledger(contractState.data).message : null));

export const createMessageContract = (coinPublicKey: CoinPublicKey): MessageContract =>
  new Contract(withZswapWitnesses(witnesses)(encodeCoinPublicKey(coinPublicKey)));

const join = async (providers: MessageProviders, rli: Interface, logger: Logger): Promise<DeployedMessageContract> => {
  const contractAddress = await rli.question('What is the contract address (in hex)? ');
  const messageContract = await findDeployedContract(
    providers,
    contractAddress,
    createMessageContract(providers.walletProvider.coinPublicKey),
    {
      privateStateKey: 'messagePrivateState',
      initialPrivateState: { message: "Hello world (Private state set when joined contract)" },
    },
  );
  logger.info(`Joined contract at address: ${messageContract.finalizedDeployTxData.contractAddress}`);
  return messageContract;
};

const deploy = async (providers: MessageProviders, logger: Logger): Promise<DeployedMessageContract> => {
  logger.info(`Deploying message contract...`);
  const counterContract = await deployContract(
    providers,
    'messagePrivateState',
    { message: "Hello world (Private state set when deploying contract)" },
    createMessageContract(providers.walletProvider.coinPublicKey),
  );
  logger.info(`Deployed contract at address: ${counterContract.finalizedDeployTxData.contractAddress}`);
  return counterContract;
};

const DEPLOY_OR_JOIN_QUESTION = `
You can do one of the following:
  1. Deploy a new counter contract
  2. Join an existing counter contract
Which would you like to do? `;

const deployOrJoin = async (
  providers: MessageProviders,
  rli: Interface,
  logger: Logger,
): Promise<DeployedMessageContract> => {
  while (true) {
    const choice = await rli.question(DEPLOY_OR_JOIN_QUESTION);
    switch (choice) {
      case '1':
        return await deploy(providers, logger);
      case '2':
        return await join(providers, rli, logger);
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

const set_message = async (messageContract: DeployedMessageContract, logger: Logger): Promise<void> => {
  const { txHash, blockHeight } = await messageContract.contractCircuitsInterface.set_message().then((u) => u.submit());
  logger.info(`Transaction ${txHash} added in block ${blockHeight}`);
};

const displayMessageValue = async (
  providers: MessageProviders,
  messageContract: DeployedMessageContract,
  logger: Logger,
): Promise<void> => {
  const contractAddress = messageContract.finalizedDeployTxData.contractAddress;
  const messageValue = await getMessageLedgerState(providers, contractAddress);
  if (messageValue === null) {
    logger.info(`There is no message contract deployed at ${contractAddress}.`);
  } else {
    logger.info(`Current message value: ${messageValue}`);
  }
};

const MAIN_LOOP_QUESTION = `
You can do one of the following:
  1. Set message
  2. Display current counter value
  3. Exit
Which would you like to do? `;

const mainLoop = async (providers: MessageProviders, rli: Interface, logger: Logger): Promise<void> => {
  const messageContract = await deployOrJoin(providers, rli, logger);
  while (true) {
    const choice = await rli.question(MAIN_LOOP_QUESTION);
    switch (choice) {
      case '1':
        await set_message(messageContract, logger);
        break;
      case '2':
        await displayMessageValue(providers, messageContract, logger);
        break;
      case '3':
        logger.info('Goodbye');
        return;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

const createWalletAndMidnightProvider = async (wallet: Wallet): Promise<WalletProvider & MidnightProvider> => {
  const state = await Rx.firstValueFrom(wallet.state());
  return {
    coinPublicKey: state.coinPublicKey,
    balanceTx(tx: UnbalancedTransaction, newCoins: CoinInfo[]): Promise<BalancedTransaction> {
      return wallet
        .balanceTransaction(ZswapTransaction.deserialize(tx.tx.serialize()), newCoins)
        .then((tx) => wallet.proveTransaction(tx))
        .then((zswapTx) => Transaction.deserialize(zswapTx.serialize()))
        .then(createBalancedTx);
    },
    submitTx(tx: BalancedTransaction): Promise<TransactionId> {
      return wallet.submitTransaction(tx.tx);
    },
  };
};

const waitForFunds = (wallet: Wallet, logger: Logger) =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(10_000),
      Rx.tap((state) => {
        const scanned = state.syncProgress?.synced ?? 0n;
        const total = state.syncProgress?.total.toString() ?? 'unknown number';
        logger.info(`Wallet scanned ${scanned} blocks out of ${total}`);
      }),
      Rx.filter((state) => {
        // Let's allow progress only if wallet is close enough
        const synced = state.syncProgress?.synced ?? 0n;
        const total = state.syncProgress?.total ?? 1_000n;
        return total - synced < 100n;
      }),
      Rx.map((s) => s.balances[nativeToken()] ?? 0n),
      Rx.filter((balance) => balance > 0n),
    ),
  );

const buildWalletAndWaitForFunds = async (
  { indexer, indexerWS, node, proofServer }: Config,
  logger: Logger,
  seed: string,
): Promise<Wallet & Resource> => {
  const wallet = await WalletBuilder.buildFromSeed(indexer, indexerWS, proofServer, node, seed, 'warn');
  wallet.start();
  const state = await Rx.firstValueFrom(wallet.state());
  logger.info(`Your wallet seed is: ${seed}`);
  logger.info(`Your wallet address is: ${state.address}`);
  let balance = state.balances[nativeToken()];
  if (balance === undefined || balance === 0n) {
    logger.info(`Your wallet balance is: 0`);
    logger.info(`Waiting to receive tokens...`);
    balance = await waitForFunds(wallet, logger);
  }
  logger.info(`Your wallet balance is: ${balance}`);
  return wallet;
};

const randomBytes = (length: number): Uint8Array => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
};

const buildFreshWallet = async (config: Config, logger: Logger): Promise<Wallet & Resource> =>
  await buildWalletAndWaitForFunds(config, logger, toHex(randomBytes(32)));

const buildWalletFromSeed = async (config: Config, rli: Interface, logger: Logger): Promise<Wallet & Resource> => {
  const seed = await rli.question('Enter your wallet seed: ');
  return await buildWalletAndWaitForFunds(config, logger, seed);
};

const WALLET_LOOP_QUESTION = `
You can do one of the following:
  1. Build a fresh wallet
  2. Build wallet from a seed
Which would you like to do? `;

const buildWallet = async (config: Config, rli: Interface, logger: Logger): Promise<Wallet & Resource> => {
  while (true) {
    const choice = await rli.question(WALLET_LOOP_QUESTION);
    switch (choice) {
      case '1':
        return await buildFreshWallet(config, logger);
      case '2':
        return await buildWalletFromSeed(config, rli, logger);
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

export const run = async (config: Config, logger: Logger, dockerEnv?: DockerComposeEnvironment): Promise<void> => {
  const rli = createInterface({ input, output, terminal: true });
  let env;
  if (dockerEnv !== undefined) {
    env = await dockerEnv.up();
  }
  const wallet = await buildWallet(config, rli, logger);
  try {
    const walletAndMidnightProvider = await createWalletAndMidnightProvider(wallet);
    const providers = {
      privateStateProvider: inMemoryPrivateStateProvider<PrivateStates>(),
      publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
      zkConfigProvider: new NodeZkConfigProvider<'set_message'>(config.zkConfigPath),
      proofProvider: httpClientProofProvider(config.proofServer),
      walletProvider: walletAndMidnightProvider,
      midnightProvider: walletAndMidnightProvider,
    };
    await mainLoop(providers, rli, logger);
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Found error '${e.message}'`);
      logger.info('Exiting...');
    } else {
      throw e;
    }
  } finally {
    try {
      rli.close();
      rli.removeAllListeners();
    } catch (e) {
    } finally {
      try {
        await wallet.close();
      } catch (e) {
      } finally {
        try {
          if (env !== undefined) {
            await env.down();
          }
        } catch (e) {}
      }
    }
  }
};
