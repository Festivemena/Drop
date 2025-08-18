import * as nearAPI from "near-api-js";

let near, walletConnection, contract;

const CONTRACT_NAME = process.env.REACT_APP_CONTRACT_ID || 'drop-contract.testnet';

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
  walletConnection = new nearAPI.WalletConnection(near, "near-drop");
  
  return { near, walletConnection };
}

export async function getWallet() {
  if (!walletConnection) {
    await initNear();
  }
  return walletConnection;
}

export async function getContract() {
  if (!contract) {
    const wallet = await getWallet();
    
    contract = new nearAPI.Contract(
      wallet.account(),
      CONTRACT_NAME,
      {
        viewMethods: [
          'get_drop',
          'get_drop_for_key',
          'estimate_near_drop_cost',
          'estimate_ft_drop_cost',
          'estimate_nft_drop_cost',
          'get_ft_drop_info',
          'get_nft_drop_info'
        ],
        changeMethods: [
          'create_near_drop',
          'create_ft_drop',
          'create_nft_drop',
          'claim_for',
          'create_account_and_claim',
          'create_named_account_and_claim'
        ]
      }
    );
  }
  
  return contract;
}

export async function getAccountBalance(accountId) {
  try {
    const account = await near.account(accountId);
    const balance = await account.getAccountBalance();
    return balance;
  } catch (error) {
    console.error('Error fetching balance:', error);
    return null;
  }
}

export async function checkAccountExists(accountId) {
  try {
    const account = await near.account(accountId);
    await account.state();
    return true;
  } catch (error) {
    return false;
  }
}

// Helper function to format NEAR amounts
export function formatNearAmount(amountInYocto) {
  return nearAPI.utils.format.formatNearAmount(amountInYocto);
}

// Helper function to parse NEAR amounts
export function parseNearAmount(amountInNear) {
  return nearAPI.utils.format.parseNearAmount(amountInNear);
}

// Helper function to create a contract call with proper error handling
export async function callContract(methodName, args = {}, options = {}) {
  try {
    const contract = await getContract();
    return await contract[methodName](args, options);
  } catch (error) {
    console.error(`Contract call failed for ${methodName}:`, error);
    throw new Error(`Failed to call ${methodName}: ${error.message}`);
  }
}

// Helper function to create a view call with proper error handling
export async function viewContract(methodName, args = {}) {
  try {
    const contract = await getContract();
    return await contract[methodName](args);
  } catch (error) {
    console.error(`View call failed for ${methodName}:`, error);
    throw new Error(`Failed to view ${methodName}: ${error.message}`);
  }
}
