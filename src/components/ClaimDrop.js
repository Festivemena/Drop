import React, { useState } from "react";

export default function ClaimDrop() {
  const [link, setLink] = useState("");

  function claimDrop() {
    alert(`Claiming drop from link: ${link}`);
    setLink("");
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      <h3>Claim a Drop</h3>
      <input
        type="text"
        placeholder="Enter Drop Link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />
      <button onClick={claimDrop}>Claim</button>
    </div>
  );
}
