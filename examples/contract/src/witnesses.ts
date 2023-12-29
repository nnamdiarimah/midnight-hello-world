import { Ledger, Maybe } from './managed/counter/contract/index.cjs';
import { WitnessContext } from '@midnight-ntwrk/compact-runtime';

// This is how we type an empty object.
export type MessagePrivateState = {
    readonly message: string;
  };
  
  export const createMessagePrivateState = () => ({
    message: null,
  });
  
  export const witnesses = {
    local_message: ({ privateState }: WitnessContext<Ledger, MessagePrivateState>): [MessagePrivateState, Maybe<string>] => [
      privateState,
      privateState.message
        ? { is_some: true, value: privateState.message }
        : { is_some: false, value: '' },
    ]
  };
  