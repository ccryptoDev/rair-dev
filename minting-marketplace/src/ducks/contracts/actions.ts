import * as types from './types';

const setChainId = (currentChain: BlockchainType | undefined) =>
  ({
    type: types.SET_CHAIN_ID,
    currentChain
  } as const);

const setUserAddress = (currentUserAddress: string | undefined) =>
  ({ type: types.SET_USER_ADDRESS, currentUserAddress } as const);

const setProgrammaticProvider = (programmaticProvider: any) =>
  ({
    type: types.SET_PROGRAMMATIC_PROVIDER,
    programmaticProvider
  } as const);

const setRealChain = (realChain: BlockchainType | undefined) =>
  ({
    type: types.SET_REAL_CHAIN,
    realChain
  } as const);

export { setChainId, setProgrammaticProvider, setRealChain, setUserAddress };
