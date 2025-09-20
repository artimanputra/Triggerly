"use client";
import { useState } from "react";
import { Input } from "../Input";
import { PrimaryButton } from "../buttons/PrimaryButton";

export default function EmailSelector({
  setMetadata,
}: {
  setMetadata: (params: Record<string, unknown>) => void;
}) {
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");

  return (
    <div>
      <Input
        label={"To"}
        type={"text"}
        placeholder="To"
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label={"Body"}
        type={"text"}
        placeholder="Body"
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="pt-2">
        <PrimaryButton
          onClick={() => {
            setMetadata({ email, body });
          }}
        >
          Submit
        </PrimaryButton>
      </div>
    </div>
  );
}
