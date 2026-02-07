'use client';

import Image from "next/image";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAppSelector } from "@/app/redux/hook";
import { useEffect } from "react";

interface Comment {
  id: number;
  author: string;
  authorImage: string;
  content: string;
  date: string;
}

interface Blog {
  id: string;
  title: string;
  content: string;
  tags: string[];
  editable: boolean;
  image: string;
  likes: number;
  comments: number;
  liked: boolean;
  username: string;
  userImage: string;
  createdAt: string;
}

export default function BlogPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const blogId = id;
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const userId = useAppSelector((state) => state.auth.user?.id);
  const isAuthenticated = useAppSelector((state) => Boolean(state.auth.token));

  console.log("Blog ID from params:", blogId);
  console.log("User ID from state:", userId);

  useEffect(() => {
    handleBlogFetch();
  }, [blogId]);

  const handleBlogFetch = async () => {
    try {
      setLoading(true);
      const url = userId 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/blog/getBlog?userId=${userId}&blogId=${blogId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/blog/getBlog?blogId=${blogId}`;
      
      const res = await axios.get(url);
      setBlog(res.data);
      setIsLiked(res.data.liked);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const toggleLike = async () => {
    // Check if user is authenticated
    if (!isAuthenticated || !userId) {
      const shouldRedirect = window.confirm("You need to sign up to like this blog. Would you like to go to the signup page?");
      if (shouldRedirect) {
        router.push('/signup');
      }
      return;
    }

    try {
      if (isLiked) {
        // Remove like
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/like&comment/removeLike?blogId=${blogId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}` // Adjust based on your auth setup
            }
          }
        );
        setIsLiked(false);
        setBlog(blog ? { ...blog, likes: blog.likes - 1 } : null);
      } else {
        // Add like
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/like&comment/like?blogId=${blogId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}` // Adjust based on your auth setup
            }
          }
        );
        setIsLiked(true);
        setBlog(blog ? { ...blog, likes: blog.likes + 1 } : null);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleCommentClick = () => {
    if (!isAuthenticated || !userId) {
      const shouldRedirect = window.confirm("You need to sign up to comment on this blog. Would you like to go to the signup page?");
      if (shouldRedirect) {
        router.push('/signup');
      }
      return;
    }
    // Focus on comment input
    document.getElementById('comment-input')?.focus();
  };

  const addComment = async () => {
    if (!isAuthenticated || !userId) {
      const shouldRedirect = window.confirm("You need to sign up to comment. Would you like to go to the signup page?");
      if (shouldRedirect) {
        router.push('/signup');
      }
      return;
    }

    if (!commentText.trim()) return;

    try {
      // TODO: Add your comment API call here when the controller is ready
      // await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/like&comment/comment`, {
      //   blogId,
      //   content: commentText
      // });
      
      // For now, just clear the input
      setCommentText("");
      // Refresh blog data to get updated comments
      handleBlogFetch();
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleEdit = () => {
    router.push(`/edit-blog/${blogId}`);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this blog? This action cannot be undone.");
    
    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/blog/deleteBlog/${blogId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}` // Adjust based on your auth setup
          }
        }
      );
      alert("Blog deleted successfully!");
      router.push('/blog-feed');
    } catch (err) {
      console.error("Error deleting blog:", err);
      alert("Failed to delete blog. Please try again.");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Blog not found</h2>
          <button
            onClick={() => router.push('/blog-feed')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 text-sm md:text-base"
        >
          <span>←</span>
          <span>Back</span>
        </button>

        {/* Blog Content */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          {/* Author Info and Action Buttons */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Image
                src={blog.userImage || "/default-avatar.png"}
                alt={blog.username}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="font-semibold text-gray-800">{blog.username}</p>
                <p className="text-sm text-gray-500">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Edit and Delete Buttons (Only visible to owner) */}
            {blog.editable && (
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6">
            {blog.title}
          </h1>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Blog Image */}
          {blog.image && (
            <div className="mb-6 rounded-xl overflow-hidden">
              <Image
                src={blog.image}
                alt={blog.title}
                width={800}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Full Content */}
          <div className="prose max-w-none mb-8">
            {blog.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Like and Comment Section */}
          <div className="flex items-center gap-6 py-4 border-t border-b border-gray-200 mb-6">
            <button
              onClick={toggleLike}
              className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
            >
              <span className={`text-xl ${isLiked ? 'text-red-500' : ''}`}>
                {isLiked ? '❤️' : '🤍'}
              </span>
              <span className="font-semibold">{blog.likes}</span>
            </button>
            <button
              onClick={handleCommentClick}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors"
            >
              <span className="text-xl">💬</span>
              <span className="font-semibold">{blog.comments}</span>
            </button>
          </div>

          {/* Comment Input */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Comments</h3>
            <div className="flex gap-3">
              <input
                id="comment-input"
                type="text"
                placeholder={isAuthenticated ? "Write a comment..." : "Sign up to comment..."}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addComment();
                  }
                }}
                onFocus={() => {
                  if (!isAuthenticated) {
                    handleCommentClick();
                  }
                }}
                className="flex-1 px-3 md:px-4 py-2 md:py-3 border rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addComment}
                className="px-4 md:px-6 py-2 md:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm md:text-base transition-colors"
              >
                Post
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {blog.comments === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Comments feature coming soon! ({blog.comments} comments)
              </p>
              // TODO: Map through actual comments when comment endpoint is ready
            )}
          </div>
        </div>
      </div>
    </div>
  );
}