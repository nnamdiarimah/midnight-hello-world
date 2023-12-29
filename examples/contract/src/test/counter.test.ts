import { it, describe, expect } from '@jest/globals';
import { CounterSimulator } from './counter-simulator.js';
import { networkId, setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

setNetworkId(networkId.undeployed);

describe('Counter smart contract', () => {
  it('generates initial ledger state deterministically', () => {
    const simulator0 = new CounterSimulator();
    const simulator1 = new CounterSimulator();
    expect(simulator0.getLedger()).toEqual(simulator1.getLedger());
  });

  it('properly initializes ledger state and private state', () => {
    const simulator = new CounterSimulator();
    const initialLedgerState = simulator.getLedger();
    expect(initialLedgerState.message).toEqual(0n);
    const initialPrivateState = simulator.getPrivateState();
    expect(initialPrivateState).toEqual({});
  });

  it('increments the counter correctly', () => {
    const simulator = new CounterSimulator();
    const nextLedgerState = simulator.increment();
    expect(nextLedgerState.message).toEqual(1n);
    const nextPrivateState = simulator.getPrivateState();
    expect(nextPrivateState).toEqual({});
  });
});
