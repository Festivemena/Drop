import React, { useState } from "react";
import { initNear, getWallet } from "../utils/near";

export default function Wallet() {
  const [accountId, setAccountId] = useState(null);

  async function connect() {
    const { walletConnection } = await initNear();
    walletConnection.requestSignIn();
  }

  async function disconnect() {
    const wallet = await getWallet();
    wallet.signOut();
    window.location.reload();
  }

  async function checkAccount() {
    const wallet = await getWallet();
    if (wallet.getAccountId()) {
      setAccountId(wallet.getAccountId());
    }
  }

  React.useEffect(() => {
    checkAccount();
  }, []);

  return (
    <div>
      {accountId ? (
        <>
          <p>Connected as: <b>{accountId}</b></p>
          <button onClick={disconnect}>Disconnect</button>
        </>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  );
}
