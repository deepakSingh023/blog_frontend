"use client";
import Link from "next/link";
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/redux/hook";
import { registerUser, resetAuthState } from "@/app/redux/slices/AuthSlice";
import { fetchProfile } from "@/app/redux/slices/ProfileSlice";

export default function Signup() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    dispatch(resetAuthState());
  }, [dispatch]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(registerUser({ username, email, password })).unwrap();
      await dispatch(fetchProfile()).unwrap();
      router.push("/profile");
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  return (
    <div className="flex items-center justify-center px-6 min-h-screen">
      <div className="w-full max-w-xl">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-8 p-10 sm:p-14 rounded-3xl shadow-xl border bg-white"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-center">
            Create your account
          </h1>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="h-14 text-lg px-5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="h-14 text-lg px-5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
          />

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
            className="h-14 text-lg px-5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={loading}
            className="h-14 rounded-2xl text-xl font-semibold bg-black text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          <Link href="/auth/login">
            <p className="text-base text-center text-gray-500">
              Already have an account?{" "}
              <span className="underline cursor-pointer">Login</span>
            </p>
          </Link>
        </form>
      </div>
    </div>
  );
}