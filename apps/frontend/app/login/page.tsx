"use client";
import { Appbar } from "../../components/Appbar";
import { CheckFeature } from "../../components/CheckFeature";
import { Input } from "../../components/Input";
import { PrimaryButton } from "../../components/buttons/PrimaryButton";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../authContext";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
   
      setError(null);
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/signin`, {
        username:email,     
        password,
      });
      login(res.data.token); 
      router.push("/dashboard");
    
  };

  return (
    <div>
      <Appbar />
      <div className="flex justify-center">
        <div className="flex pt-8 max-w-4xl">
          {/* Left side */}
          <div className="flex-1 pt-20 px-4">
            <div className="font-semibold text-3xl pb-4">
              Join millions worldwide who automate their work using Zapier.
            </div>
            <div className="pb-6 pt-4">
              <CheckFeature label={"Easy setup, no coding required"} />
            </div>
            <div className="pb-6">
              <CheckFeature label={"Free forever for core features"} />
            </div>
            <CheckFeature label={"14-day trial of premium features & apps"} />
          </div>

          {/* Right side - login form */}
          <div className="flex-1 pt-6 pb-6 mt-12 px-4 border rounded">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label={"Email"}
              type="text"
              placeholder="Your Email"
            />
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label={"Password"}
              type="password"
              placeholder="Password"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="pt-4">
              <PrimaryButton onClick={handleLogin} size="big">
                Login
              </PrimaryButton>
            </div>
            <div className="pt-4 text-sm">
              Don’t have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-600 hover:underline font-medium"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

