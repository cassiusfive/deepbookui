import DeepBookMarketMaker from ".";

let deepBookClient: DeepBookMarketMaker | null = null;

export const initializeDeepBook = (privateKey: string, env: 'testnet' | 'mainnet') => {
  if (!deepBookClient) {
    deepBookClient = new DeepBookMarketMaker(privateKey, env);
  }
  return deepBookClient;
};

export const getDeepBookClient = () => {
  if (!deepBookClient) {
    throw new Error('DeepBook client not initialized');
  }
  return deepBookClient;
};