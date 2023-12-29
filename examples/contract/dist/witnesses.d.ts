import { Ledger, Maybe } from './managed/counter/contract/index.cjs';
import { WitnessContext } from '@midnight-ntwrk/compact-runtime';
export type MessagePrivateState = {
    readonly message: string;
};
export declare const createMessagePrivateState: () => {
    message: null;
};
export declare const witnesses: {
    local_message: ({ privateState }: WitnessContext<Ledger, MessagePrivateState>) => [MessagePrivateState, Maybe<string>];
};
