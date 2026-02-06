"use client";

import Link from "next/link";


export default function Login() {
  return (
    <div className="flex items-center justify-center px-6">
      <div className="w-full max-w-xl">
        <form
          className="
            flex flex-col gap-8
            p-10 sm:p-14
            rounded-3xl
            shadow-xl
            border
            bg-white
          "
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-center">
            Create your account
          </h1>

          <input
            type="email"
            placeholder="Email"
            className="
              h-14
              text-lg
              px-5
              border
              rounded-2xl
              focus:outline-none
              focus:ring-2 focus:ring-black
            "
          />

          <input
            type="password"
            placeholder="Password"
            className="
              h-14
              text-lg
              px-5
              border
              rounded-2xl
              focus:outline-none
              focus:ring-2 focus:ring-black
            "
          />

          <button
            type="submit"
            className="
              h-14
              rounded-2xl
              text-xl font-semibold
              bg-black text-white
              hover:opacity-90
              transition
            "
          >
            LogIn
          </button>
          <Link href="/auth/signup">
           <p className="text-base text-center text-gray-500">
            Don't have an account?{" "}
            <span className="underline cursor-pointer">
              Sign Up
            </span>
          </p>
          </Link>


        </form>
      </div>
    </div>
  );
}

