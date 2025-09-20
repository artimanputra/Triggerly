"use client";
import { useState } from "react";
import { Input } from "../Input";
import { PrimaryButton } from "../buttons/PrimaryButton";

export default function SolanaSelector({
  setMetadata,
}: {
  setMetadata: (params: Record<string, unknown>) => void;
}) {
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");

  return (
    <div>
      <Input
        label={"To"}
        type={"text"}
        placeholder="To"
        onChange={(e) => setAddress(e.target.value)}
      />
      <Input
        label={"Amount"}
        type={"text"}
        placeholder="Amount"
        onChange={(e) => setAmount(e.target.value)}
      />
      <div className="pt-4">
        <PrimaryButton
          onClick={() => {
            setMetadata({ amount, address });
          }}
        >
          Submit
        </PrimaryButton>
      </div>
    </div>
  );
}
