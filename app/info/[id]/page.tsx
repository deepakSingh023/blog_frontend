"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { ArrowLeft, Calendar, User, Loader2 } from "lucide-react";

interface InfoResponse {
  username: string;
  userPic: string | null;
  bio: string | null;
}

interface BlogResponse {
  id: string;
  title: string;
  content: string;
  tags: string[];
  image: string;
  likes: number;
  comments: number;
  createdAt: string;
}

interface PagedResponse {
  items: BlogResponse[];
  nextCursor: string | null;
}

export default function UserInfo() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  console.log(userId)

  const [userInfo, setUserInfo] = useState<InfoResponse | null>(null);
  const [blogs, setBlogs] = useState<BlogResponse[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId) {
      fetchUserInfo();
      fetchUserBlogs();
    }
  }, [userId]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreBlogs();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, nextCursor]);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get<InfoResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/map/userInfo`,
        {
          params: { userId }
        }
      );
      setUserInfo(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching user info:", err);
      setError("Failed to load user information");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBlogs = async () => {
    try {
      const response = await axios.get<PagedResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/blog/getUserBlogs`,
        {
          params: { userId }
        }
      );
      
      setBlogs(response.data.items);
      setNextCursor(response.data.nextCursor);
      setHasMore(response.data.nextCursor !== null);
    } catch (err) {
      console.error("Error fetching user blogs:", err);
      setBlogs([]);
      setHasMore(false);
    }
  };

  const loadMoreBlogs = async () => {
    if (!nextCursor || loadingMore) return;

    try {
      setLoadingMore(true);
      const response = await axios.get<PagedResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/blog/getUserBlogs`,
        {
          params: { 
            userId,
            cursor: nextCursor 
          }
        }
      );
      
      setBlogs(prev => [...prev, ...response.data.items]);
      setNextCursor(response.data.nextCursor);
      setHasMore(response.data.nextCursor !== null);
    } catch (err) {
      console.error("Error loading more blogs:", err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const handleBlogClick = (blogId: string) => {
    router.push(`/blogs/${blogId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (error || !userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {error || "User not found"}
          </h2>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* User Profile Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex flex-col items-center text-center">
            {/* Profile Picture */}
            <div className="relative mb-4">
              {userInfo.userPic ? (
                <img
                  src={userInfo.userPic}
                  alt={userInfo.username}
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-4 border-blue-100">
                  <User size={48} className="text-white" />
                </div>
              )}
            </div>

            {/* Username */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {userInfo.username}
            </h1>
            <p className="text-gray-500 mb-4">@{userInfo.username}</p>

            {/* Bio */}
            {userInfo.bio ? (
              <p className="text-gray-700 max-w-2xl leading-relaxed">
                {userInfo.bio}
              </p>
            ) : (
              <p className="text-gray-400 italic">No bio available</p>
            )}

            {/* Blog Count */}
            <div className="mt-4 px-4 py-2 bg-blue-50 rounded-full">
              <span className="text-blue-700 font-semibold">
                {blogs.length} {blogs.length === 1 ? 'Post' : 'Posts'}
              </span>
            </div>
          </div>
        </div>

        {/* User's Blogs Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Posts by {userInfo.username}
          </h2>

          {blogs.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                {blogs.map((blog) => (
                  <div
                    key={blog.id}
                    onClick={() => handleBlogClick(blog.id)}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group"
                  >
                    {/* Blog Image */}
                    {blog.image && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Blog Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {blog.title}
                      </h3>

                      <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                        {truncateContent(blog.content)}
                      </p>

                      {/* Tags */}
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {blog.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                          {blog.tags.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                              +{blog.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                            </svg>
                            {blog.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                            </svg>
                            {blog.comments}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>{formatDate(blog.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Loading More Indicator */}
              {hasMore && (
                <div ref={observerTarget} className="flex justify-center mt-8 py-4">
                  {loadingMore && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Loading more posts...</span>
                    </div>
                  )}
                </div>
              )}

              {/* End of Posts Message */}
              {!hasMore && blogs.length > 0 && (
                <div className="text-center mt-8 py-4 text-gray-500">
                  <p>You've reached the end of {userInfo.username}'s posts</p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No posts yet
              </h3>
              <p className="text-gray-500">
                {userInfo.username} hasn't published any posts yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}