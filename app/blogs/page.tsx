'use client';

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAppSelector } from "@/app/redux/hook";
import MessageModal from "@/app/components/MessageModal";

interface FeedBlogDto {
  id: string;
  userId: String;
  title: string;
  content: string;
  image?: string;
  likeCount: number;
  Comments: number;
  username: string;
  userImage: string;
  likedByMe: boolean;
  createdAt: string;
}

interface FeedResponse {
  blogs: FeedBlogDto[];
  nextCursor: string | null;
  hasMore: boolean;
}

export default function BlogFeed() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<FeedBlogDto[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    message: '',
    showAuthButtons: false
  });

  const userId = useAppSelector((state) => state.auth.user?.id);
  const token = useAppSelector((state) => state.auth.token);
  const isAuthenticated = useAppSelector((state) => Boolean(state.auth.token));
  
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadBlogs(null);
  }, [userId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && blogs.length >= 7) {
          loadBlogs(cursor);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, cursor, blogs.length]);

  const loadBlogs = async (currentCursor: string | null) => {
    if (loading) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (currentCursor) {
        params.append('cursor', currentCursor);
      }
      
      if (userId && isAuthenticated) {
        params.append('userId', userId);
      }

      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/map/feed?${params.toString()}`;
      const res = await axios.get<FeedResponse>(url);

      setBlogs(prev => currentCursor ? [...prev, ...res.data.blogs] : res.data.blogs);
      setCursor(res.data.nextCursor);
      setHasMore(res.data.hasMore);
      setLoading(false);
    } catch (err) {
      console.error("Error loading blogs:", err);
      setLoading(false);
    }
  };

  const toggleLike = async (blogId: string, isLiked: boolean) => {
    if (!isAuthenticated || !userId) {
      setModalConfig({
        isOpen: true,
        message: "Please log in to like blogs",
        showAuthButtons: true
      });
      return;
    }

    try {
      const authToken = token;
      
      if (!authToken) {
        console.error('No auth token available');
        return;
      }
      
      // Fixed: Use correct endpoint based on current like status
      const endpoint = isLiked 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/like&comment/removeLike`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/like&comment/like`;
      
      await axios.post(
        `${endpoint}?blogId=${blogId}`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      // Update UI optimistically
      setBlogs(blogs.map(blog =>
        blog.id === blogId
          ? {
              ...blog,
              likedByMe: !isLiked,
              likeCount: isLiked ? blog.likeCount - 1 : blog.likeCount + 1
            }
          : blog
      ));
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleCommentClick = (blogId: string) => {
    router.push(`/blogs/${blogId}`);
  };

  const navigateToBlog = (blogId: string) => {
    router.push(`/blogs/${blogId}`);
  };

  const getInitials = (username: string | null | undefined) => {
    if (!username || username.trim() === '') return 'U';
    return username.charAt(0).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Unknown date';
    }
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MessageModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        message={modalConfig.message}
        showAuthButtons={modalConfig.showAuthButtons}
      />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Blog Feed</h1>

        <div className="space-y-6">
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {/* User Info Header */}
              <div onClick={() => router.push(`/info/${blog.userId}`)} className="p-4 md:p-6 flex items-center gap-3 border-b border-gray-100">
                {blog.userImage ? (
                  <Image
                    src={blog.userImage}
                    alt={`${blog.username || 'User'}'s profile picture`}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                    {getInitials(blog.username)}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {blog.username || 'Anonymous User'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(blog.createdAt)}
                  </p>
                </div>
              </div>

              {/* Blog Content */}
              <div
                onClick={() => navigateToBlog(blog.id)}
                className="cursor-pointer"
              >
                {/* Blog Image - Fixed to match BlogPage */}
                {blog.image && (
                  <div className="relative w-full h-64 md:h-96 bg-gray-100">
                    <Image
                      src={blog.image}
                      alt={blog.title || 'Blog image'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={false}
                    />
                  </div>
                )}

                <div className="p-4 md:p-6">
                  {/* Title */}
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 hover:text-blue-600 transition-colors">
                    {blog.title || 'Untitled Blog'}
                  </h2>
                  
                  {/* Content Preview */}
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {truncateContent(blog.content)}
                  </p>
                  
                  {/* Read More Link */}
                  <span className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                    Read more
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5l7 7-7 7" 
                      />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 md:px-6 pb-4 flex gap-6 border-t border-gray-100 pt-3">
                <button
                  onClick={() => toggleLike(blog.id, blog.likedByMe)}
                  className="flex items-center gap-2 hover:opacity-70 transition-all duration-200 group"
                  aria-label={blog.likedByMe ? 'Unlike post' : 'Like post'}
                >
                  <span 
                    className={`text-xl transition-transform group-hover:scale-110 ${
                      blog.likedByMe ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    {blog.likedByMe ? '❤️' : '🤍'}
                  </span>
                  <span className="text-gray-700 font-medium">
                    {blog.likeCount || 0}
                  </span>
                </button>

                <button
                  onClick={() => handleCommentClick(blog.id)}
                  className="flex items-center gap-2 hover:opacity-70 transition-all duration-200 group"
                  aria-label="View comments"
                >
                  <span className="text-xl transition-transform group-hover:scale-110">
                    💬
                  </span>
                  <span className="text-gray-700 font-medium">
                    {blog.Comments || 0}
                  </span>
                </button>
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-2">Loading more blogs...</p>
            </div>
          )}

          {!hasMore && blogs.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">You've reached the end</p>
            </div>
          )}

          {blogs.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No blogs available yet</p>
              <p className="text-gray-400 text-sm mt-2">Be the first to create one!</p>
            </div>
          )}

          <div ref={observerTarget} className="h-4" />
        </div>
      </div>
    </div>
  );
}