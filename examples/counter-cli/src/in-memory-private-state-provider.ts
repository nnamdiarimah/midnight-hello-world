import { type PrivateStateProvider, type PrivateStateSchema } from '@midnight-ntwrk/midnight-js-types';

export const inMemoryPrivateStateProvider = <PSS extends PrivateStateSchema>(): PrivateStateProvider<PSS> => {
  const record: PSS = {} as unknown as PSS;
  return {
    set<PSK extends keyof PSS>(key: PSK, state: PSS[PSK]): Promise<void> {
      record[key] = state;
      return Promise.resolve();
    },
    get<PSK extends keyof PSS>(key: PSK): Promise<PSS[PSK] | null> {
      const value = record[key] ?? null;
      return Promise.resolve(value);
    },
    remove<PSK extends keyof PSS>(key: PSK): Promise<void> {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete record[key];
      return Promise.resolve();
    },
    clear(): Promise<void> {
      Object.keys(record).forEach((key) => {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete record[key];
      });
      return Promise.resolve();
    },
  };
};
