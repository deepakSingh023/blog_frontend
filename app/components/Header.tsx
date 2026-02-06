"use client";


import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, Search, User } from "lucide-react";

export default function Header({ user: user }: { user: any }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const router = useRouter();

  return (
    <header className="w-full border-b shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Left: Logo */}
        <div className="text-xl font-bold cursor-pointer" onClick={()=>router.push("/")}>MyBlog</div>

        {/* Middle: Search (desktop) */}
        <button className="hidden md:flex items-center gap-2 px-4 py-2 border rounded-full">
          <Search size={18} />
          <span>Search blogs</span>
        </button>

        {/* Right: Auth / Profile (desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <>
            <Link href="/auth/login" >
            <button className="px-4 py-2">Login</button>
            </Link>
            <Link href="/auth/signup" >
            <button className="px-4 py-2 border rounded">Signup</button>
            </Link>
              
              
            </>
          ) : (
            <>
              <button className="px-4 py-2">Logout</button>
              <img
                src={user.avatar}
                alt="profile"
                className="w-9 h-9 rounded-full cursor-pointer"
              />
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t px-4 py-4 space-y-4">
          <button className="flex items-center gap-2 w-full">
            <Search size={18} /> Search blogs
          </button>

          {!user ? (
            <>
              <button className="w-full text-left">Login</button>
              <button className="w-full text-left">Signup</button>
            </>
          ) : (
            <>
              <button className="w-full text-left">My Profile</button>
              <button className="w-full text-left">Logout</button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
