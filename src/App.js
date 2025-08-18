import React from "react";
import Wallet from "./components/Wallet";
import DropForm from "./components/DropForm";
import ClaimDrop from "./components/ClaimDrop";

export default function App() {
  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>🚀 NEAR Drop Frontend</h1>
      <Wallet />
      <DropForm />
      <ClaimDrop />
    </div>
  );
}
