import { type Contract, type MessagePrivateState } from '@midnight-ntwrk/counter-contract';
import { type Witnesses } from '@midnight-ntwrk/counter-contract/dist/managed/counter/contract/index.cjs';
import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { type DeployedContract, type StateWithZswap } from '@midnight-ntwrk/midnight-js-contracts';
import { type ZSwapWitnesses } from '@midnight-ntwrk/midnight-js-contracts/dist/zswap-witnesses';

export type PrivateStates = {
  messagePrivateState: MessagePrivateState;
};

export type MessageProviders = MidnightProviders<'set_message', PrivateStates>;

export type MessageContract = Contract<
  StateWithZswap<MessagePrivateState>,
  Witnesses<StateWithZswap<MessagePrivateState>>
>;

export type DeployedMessageContract = DeployedContract<PrivateStates, 'messagePrivateState', MessageContract>;
