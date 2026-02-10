"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Search } from "lucide-react";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "@/app/redux/hook";
import { logout } from "@/app/redux/slices/AuthSlice";
import { fetchProfile, clearProfile } from "@/app/redux/slices/ProfileSlice";
import { clearBlogs } from "@/app/redux/slices/BlogSlice";

interface BackendSearchResult {
  type: "BLOG" | "AUTHOR";
  id: string;
  username?:String;
  title: string;
  score: number;
}

interface DisplaySearchResult {
  id: string;
  type: "BLOG" | "AUTHOR";
  username?:String;
  title: string;
  score: number;
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DisplaySearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = useAppSelector((state) => Boolean(state.auth.token));
  const profile = useAppSelector((state) => state.profile.data);

  useEffect(() => {
    if (isAuthenticated && !profile) {
      dispatch(fetchProfile());
    }
  }, [isAuthenticated, profile, dispatch]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const debounceTimer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    try {
      setSearchLoading(true);
      const response = await axios.get<BackendSearchResult[]>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/map/search`,
        {
          params: { query: query.trim() }
        }
      );
      
      // Map backend results to display format
      const mappedResults: DisplaySearchResult[] = response.data.map(result => ({
        id: result.id,
        type: result.type,
        username:result.username,
        title: result.title,
        score: result.score
      }));
      
      setSearchResults(mappedResults);
      setShowSearchResults(true);
      setSearchLoading(false);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setSearchLoading(false);
    }
  };

  const handleSearchResultClick = (result: DisplaySearchResult) => {
    setShowSearchResults(false);
    setSearchQuery("");
    setSearchResults([]);
    
    if (result.type === "BLOG") {
      router.push(`/blogs/${result.id}`);
    } else if (result.type === "AUTHOR") {
      router.push(`/profile/${result.id}`);
    }
  };

  return (
    <header className="w-full border-b shadow-sm bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <div
          className="text-xl font-bold cursor-pointer"
          onClick={() => router.push("/")}
        >
          MyBlog
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:block relative flex-1 max-w-md mx-8" ref={searchRef}>
          <div className="relative">
            <div className="flex items-center gap-2 px-4 py-2 border rounded-full text-gray-600 bg-white hover:bg-gray-50 transition-colors">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search blogs and authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowSearchResults(true);
                  }
                }}
                className="flex-1 outline-none bg-transparent text-sm"
              />
              {searchLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                {searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((result) => (
                      <div
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSearchResultClick(result)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {result.title || 'Untitled'}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                result.type === 'BLOG' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {result.type === 'BLOG' ? 'Blog' : 'Author'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.trim() && !searchLoading ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    No results found for "{searchQuery}"
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

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
                onClick={() => {
                  dispatch(logout());
                  dispatch(clearProfile());
                  dispatch(clearBlogs());
                  setMenuOpen(false);
                  router.replace("/auth/login");
                }}
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
          {/* Mobile Search Bar */}
          <div className="relative" ref={searchRef}>
            <div className="flex items-center gap-2 w-full px-4 py-2 border rounded-lg">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search blogs and authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowSearchResults(true);
                  }
                }}
                className="flex-1 outline-none text-sm"
              />
              {searchLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              )}
            </div>

            {/* Mobile Search Results */}
            {showSearchResults && (
              <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
                {searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((result) => (
                      <div
                        key={`${result.type}-${result.id}`}
                        onClick={() => {
                          handleSearchResultClick(result);
                          setMenuOpen(false);
                        }}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      >
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                          {result.title || 'Untitled'}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            result.type === 'BLOG' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {result.type === 'BLOG' ? 'Blog' : 'Author'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.trim() && !searchLoading ? (
                  <div className="px-4 py-6 text-center text-gray-500 text-sm">
                    No results found for "{searchQuery}"
                  </div>
                ) : null}
              </div>
            )}
          </div>

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
                onClick={() => {
                  dispatch(logout());
                  dispatch(clearProfile());
                  dispatch(clearBlogs());
                  setMenuOpen(false);
                  router.replace("/auth/login");
                }}
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