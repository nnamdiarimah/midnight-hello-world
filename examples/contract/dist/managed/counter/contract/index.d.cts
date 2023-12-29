import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Maybe<a> = { is_some: boolean; value: a };

export type Witnesses<T> = {
  local_message(context: __compactRuntime.WitnessContext<Ledger, T>): [T, Maybe<string>];
}

export type ImpureCircuits<T> = {
  set_message(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, void>;
}

export type PureCircuits = {
}

export type Circuits<T> = {
  set_message(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, void>;
}

export type Ledger = {
  readonly message: string;
}

export declare class Contract<T, W extends Witnesses<T> = Witnesses<T>> {
  witnesses: W;
  circuits: Circuits<T>;
  impureCircuits: ImpureCircuits<T>;
  constructor(witnesses: W);
  initialState(privateState: T): [T, __compactRuntime.ContractState];
}

export declare function ledger(state: __compactRuntime.StateValue): Ledger;
export declare const pureCircuits: PureCircuits;
