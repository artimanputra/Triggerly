"use client";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "./buttons/PrimaryButton";
import { LinkButton } from "./buttons/LinkButton";
import { useAuth } from "../app/authContext";   
export function Appbar() {
  const router = useRouter();
  const { token, logout } = useAuth();   

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-gray-900 text-gray-200 shadow">
      <div 
        className="text-2xl font-bold cursor-pointer" 
        onClick={() => router.push("/")}
      >
        Triggerly
      </div>
      <div className="flex gap-4">
        {token ? (
          <PrimaryButton onClick={logout}>Sign out</PrimaryButton>   
        ) : (
          <>
            <LinkButton onClick={() => router.push("/login")}>Login</LinkButton>
            <PrimaryButton onClick={() => router.push("/signup")}>
              Sign up
            </PrimaryButton>
          </>
        )}
      </div>
    </div>
  );
}
