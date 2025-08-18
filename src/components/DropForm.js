import React, { useState } from "react";

export default function DropForm() {
  const [amount, setAmount] = useState("");
  const [receiver, setReceiver] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    alert(`Drop created for ${receiver} with ${amount} NEAR!`);
    setAmount("");
    setReceiver("");
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
      <h3>Create a Drop</h3>
      <input
        type="text"
        placeholder="Receiver Account"
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount in NEAR"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button type="submit">Send Drop</button>
    </form>
  );
}
