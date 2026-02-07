"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/redux/hook";
import { logout } from "@/app/redux/slices/AuthSlice";
import { fetchProfile, clearProfile } from "@/app/redux/slices/ProfileSlice";
import { clearBlogs } from "@/app/redux/slices/BlogSlice";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector((state) => Boolean(state.auth.token));
  const profile = useAppSelector((state) => state.profile.data);

  useEffect(() => {
    if (isAuthenticated && !profile) {
      dispatch(fetchProfile());
    }
  }, [isAuthenticated, profile, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearProfile());
    dispatch(clearBlogs());
    setMenuOpen(false);
    router.replace("/auth/login");
  };

  return (
    <header className="w-full border-b shadow-sm bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <div
          className="text-xl font-bold cursor-pointer"
          onClick={() => router.push("/")}
        >
          MyBlog
        </div>

        <button className="hidden md:flex items-center gap-2 px-4 py-2 border rounded-full text-gray-600 hover:bg-gray-50">
          <Search size={18} />
          <span>Search blogs</span>
        </button>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/blogs">
            <button className="px-4 py-2 hover:text-blue-600 font-semibold">
              Blogs
            </button>
          </Link>

          {!isAuthenticated ? (
            <>
              <Link href="/auth/login">
                <button className="px-4 py-2">Login</button>
              </Link>
              <Link href="/auth/signup">
                <button className="px-4 py-2 border rounded">Signup</button>
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-red-600 hover:text-red-700"
              >
                Logout
              </button>

              <img
                src={profile?.profilePic ?? "/avatar.png"}
                alt="profile"
                className="w-9 h-9 rounded-full cursor-pointer object-cover"
                onClick={() => router.push("/profile")}
              />
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t px-4 py-4 space-y-4 bg-white">
          <button className="flex items-center gap-2 w-full">
            <Search size={18} /> Search blogs
          </button>

          <button
            className="w-full text-left font-semibold"
            onClick={() => {
              router.push("/blogs");
              setMenuOpen(false);
            }}
          >
            Blogs
          </button>

          {!isAuthenticated ? (
            <>
              <button
                className="w-full text-left"
                onClick={() => {
                  router.push("/auth/login");
                  setMenuOpen(false);
                }}
              >
                Login
              </button>
              <button
                className="w-full text-left"
                onClick={() => {
                  router.push("/auth/signup");
                  setMenuOpen(false);
                }}
              >
                Signup
              </button>
            </>
          ) : (
            <>
              <button
                className="w-full text-left"
                onClick={() => {
                  router.push("/profile");
                  setMenuOpen(false);
                }}
              >
                My Profile
              </button>
              <button
                className="w-full text-left text-red-600"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}