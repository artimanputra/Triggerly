"use client";

import React from "react";

type InputProps = {
  label: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string; // ✅ added value
  defaultValue?: string; // optional fallback if you want uncontrolled
  type?: "text" | "password";
};

export const Input = ({
  label,
  placeholder,
  onChange,
  value,
  defaultValue,
  type = "text",
}: InputProps) => {
  return (
    <div>
      <div className="text-sm pb-1 pt-2">
        * <label>{label}</label>
      </div>
      <input
        className="border rounded px-4 py-2 w-full border-black"
        type={type}
        placeholder={placeholder}
        value={value} // ✅ controlled value support
        defaultValue={defaultValue} // works if you don't pass `value`
        onChange={onChange}
      />
    </div>
  );
};
