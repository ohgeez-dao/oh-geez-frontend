import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import detectEthereumProvider from "@metamask/detect-provider";

import logo from "./morty.png";
import abi from "./abi.json";
import accounts from "./oh-geez.json";
import "./App.css";

const leaves = accounts.map((v) => keccak256(v));
const tree = new MerkleTree(leaves, keccak256, { sort: true });

function App() {
  const [address, setAddress] = useState("");
  const [provider, setProvider] = useState();

  useEffect(() => {
    detectEthereumProvider().then((p) => {
      setProvider(p);
      if (!p) alert("Please install MetaMask!");
    });
  }, []);
  const onConnect = () => {
    provider
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => setAddress(accounts[0]))
      .catch(console.error);
  };
  const onClick = () => {
    if (address) {
      const leaf = keccak256(address);
      const proof = tree.getHexProof(leaf);
      const signer = new ethers.providers.Web3Provider(provider).getSigner();
      const contract = ethers.ContractFactory.getContract(
        "0x1098269bFc70b26DeA43f18F812D2b9854E874bA",
        abi,
        signer
      );
      contract
        .claim(proof.map((item) => ethers.utils.arrayify(item)))
        .then((tx) =>
          tx
            .wait()
            .then(() => alert("Claimed!"))
            .catch((e) => {
              alert(e.message);
              console.error(e);
            })
        )
        .catch((e) => {
          console.error(e);
        });
    }
    return true;
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {provider?.isConnected() && address ? (
          <>
            <input
              value={address}
              type={"text"}
              readOnly={true}
              className={"App-input"}
            />
            <button className="App-button" onClick={onClick}>
              Claim
            </button>
          </>
        ) : (
          <button className="App-button" onClick={onConnect}>
            Connect
          </button>
        )}
      </header>
    </div>
  );
}

export default App;
