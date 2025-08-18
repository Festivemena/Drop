import * as nearAPI from "near-api-js";

let near, walletConnection;

export async function initNear() {
  const config = {
    networkId: "testnet",
    keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore(),
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
  };

  near = await nearAPI.connect(config);
  walletConnection = new nearAPI.WalletConnection(near);
  return { near, walletConnection };
}

export async function getWallet() {
  if (!walletConnection) {
    await initNear();
  }
  return walletConnection;
}
