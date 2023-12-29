'use strict';
const __compactRuntime = require('@midnight-ntwrk/compact-runtime');
const expectedRuntimeVersionString = '0.6.11';
const expectedRuntimeVersion = expectedRuntimeVersionString.split('.').map(Number);
const actualRuntimeVersion = __compactRuntime.versionString.split('.').map(Number);
if (expectedRuntimeVersion[0] != actualRuntimeVersion[0]
     || (actualRuntimeVersion[0] == 0 && expectedRuntimeVersion[1] != actualRuntimeVersion[1])
     || expectedRuntimeVersion[1] > actualRuntimeVersion[1]
     || (expectedRuntimeVersion[1] == actualRuntimeVersion[1] && expectedRuntimeVersion[2] > actualRuntimeVersion[2]))
   throw new __compactRuntime.CompactError(`Version mismatch: compiled code expects ${expectedRuntimeVersionString}, runtime is ${__compactRuntime.versionString}`);
{ const MAX_FIELD = 52435875175126190479447740508185965837690552500527637822603658699938581184512n;
  if (__compactRuntime.MAX_FIELD !== MAX_FIELD)
     throw new __compactRuntime.CompactError(`compiler thinks maximum field value is ${MAX_FIELD}; run time thinks it is ${__compactRuntime.MAX_FIELD}`)
}

const _descriptor_0 = new __compactRuntime.CompactTypeOpaqueString();

const _descriptor_1 = new __compactRuntime.CompactTypeBoolean();

class _Maybe_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value) {
    return {
      is_some: _descriptor_1.fromValue(value),
      value: _descriptor_0.fromValue(value)
    }
  }
  toValue(value) {
    return _descriptor_1.toValue(value.is_some).concat(_descriptor_0.toValue(value.value));
  }
  valueAlignment(value) {
    return _descriptor_1.valueAlignment(value.is_some).concat(_descriptor_0.valueAlignment(value.value));
  }
}

const _descriptor_2 = new _Maybe_0();

const _descriptor_3 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

const _descriptor_4 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

class Contract {
  witnesses;
  constructor(...args) {
    if (args.length !== 1)
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args.length}`);
    const witnesses = args[0];
    if (typeof(witnesses) !== 'object')
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    if (typeof(witnesses.local_message) !== 'function')
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named local_message');
    this.witnesses = witnesses;
    this.circuits = {
      set_message: (...args_0) => {
        if (args_0.length !== 1)
          throw new __compactRuntime.CompactError(`set_message: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
        const contextOrig = args_0[0];
        if (!(typeof(contextOrig) === 'object' && contextOrig.originalState != undefined && contextOrig.transactionContext != undefined))
          __compactRuntime.type_error('set_message',
                                      'argument 1 (as invoked from Typescript)',
                                      'src/message.compact line 15, char 1',
                                      'CircuitContext',
                                      contextOrig)
        const context = { ...contextOrig };
        const partialProofData = {
          input: { value: [], alignment: [] },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result = this.#_set_message_0(context, partialProofData);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result, context: context, proofData: partialProofData };
      }
    };
    this.impureCircuits = { set_message: this.circuits.set_message };
  }
  initialState(...args) {
    if (args.length !== 1)
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args.length}`);
    const privateState = args[0];
    const state = new __compactRuntime.ContractState();
    let stateValue = __compactRuntime.StateValue.newArray();
    stateValue = stateValue.arrayPush(__compactRuntime.StateValue.newNull());
    state.data = stateValue;
    state.setOperation('set_message', new __compactRuntime.ContractOperation());
    const context = {
      originalState: state,
      currentPrivateState: privateState,
      transactionContext: new __compactRuntime.QueryContext(state.data, __compactRuntime.dummyContractAddress())
    };
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                            alignment: _descriptor_3.valueAlignment(0n) }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(''),
                                                                            alignment: _descriptor_0.valueAlignment('') }).encode() } },
                     { ins: { cached: false, n: 1 } }
                    ])
    state.data = context.transactionContext.state;
    return [context.currentPrivateState, state];
  }
  #_local_message_0(context, partialProofData) {
    const contextRef = { context: context.transactionContext };
    const witnessContext = __compactRuntime.witnessContext(ledger, context.currentPrivateState, contextRef);
    const [nextPrivateState, result] = this.witnesses.local_message(witnessContext);
    context.currentPrivateState = nextPrivateState;
    context.transactionContext = contextRef.context;
    if (!(typeof(result) === 'object' && typeof(result.is_some) === 'boolean' && true))
      __compactRuntime.type_error('local_message',
                                  'return value',
                                  'src/message.compact line 4, char 1',
                                  'struct Maybe[is_some: Boolean, value: Opaque["string"]]',
                                  result)
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result),
      alignment: _descriptor_2.valueAlignment(result)
    });
    return result;
  }
  #_set_message_0(context, partialProofData) {
    const tmp = this.#_local_message_or_error_0(context, partialProofData);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                            alignment: _descriptor_3.valueAlignment(0n) }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp),
                                                                            alignment: _descriptor_0.valueAlignment(tmp) }).encode() } },
                     { ins: { cached: false, n: 1 } }
                    ]);
  }
  #_local_message_or_error_0(context, partialProofData) {
    const maybe_message = this.#_local_message_0(context, partialProofData);
    __compactRuntime.assert(maybe_message.is_some, 'No message found');
    return maybe_message.value;
  }
  static _query(context, partialProofData, prog) {
    var res;
    try {
      res = context.transactionContext.query(prog);
    } catch (err) {
      throw new __compactRuntime.CompactError(err.toString());
    }
    context.transactionContext = res.context;
    var reads = res.events.filter((e) => e.tag === 'read');
    var i = 0;
    partialProofData.publicTranscript = partialProofData.publicTranscript.concat(prog.map((op) => {
      if(typeof(op) === 'object' && 'popeq' in op) {
        return { popeq: {
          ...op.popeq,
          result: reads[i++].content,
        } };
      } else {
        return op;
      }
    }));
    if(res.events.length == 1 && res.events[0].tag === 'read') {
      return res.events[0].content;
    } else {
      return res.events;
    }
  }
}
function ledger(state) {
  const context = {
    originalState: state,
    transactionContext: new __compactRuntime.QueryContext(state, __compactRuntime.dummyContractAddress())
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    get message() {
      return _descriptor_0.fromValue(Contract._query(context,
                                                     partialProofData,
                                                     [
                                                      { dup: { n: 0 } },
                                                      { idx: { cached: false,
                                                               pushPath: false,
                                                               path: [
                                                                      { tag: 'value',
                                                                        value: { value: _descriptor_3.toValue(0n),
                                                                                 alignment: _descriptor_3.valueAlignment(0n) } }
                                                                     ] } },
                                                      { popeq: { cached: false,
                                                                 result: undefined } }
                                                     ]).value);
    }
  };
}
const _emptyContext = {
  originalState: new __compactRuntime.ContractState(),
  transactionContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({ local_message: (...args) => undefined });
const pureCircuits = { };
exports.Contract = Contract;
exports.ledger = ledger;
exports.pureCircuits = pureCircuits;
//# sourceMappingURL=index.cjs.map
