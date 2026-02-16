'use client';

import Image from "next/image";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAppSelector } from "@/app/redux/hook";
import { useEffect, useRef } from "react";
import MessageModal from "@/app/components/MessageModal";

interface CommentResponse {
  id: string;
  userId: string;
  blogId: string;
  content: string;
  createdAt: string;
  username: string;
  profilePic: string;
  IsDeleted: boolean;
  IsDeletable: boolean;
}

interface Blog {
  id: string;
  userId:String;
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
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [page, setPage] = useState(0);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, message: '', showAuthButtons: false });
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  const userId = useAppSelector((state) => state.auth.user?.id);
  const token = useAppSelector((state) => state.auth.token);
  const isAuthenticated = useAppSelector((state) => Boolean(state.auth.token));
  
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (blogId) {
      handleBlogFetch();
    }
  }, [blogId, userId]);

  useEffect(() => {
    if (blog) {
      loadComments(0);
    }
  }, [blog, userId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreComments && !commentsLoading) {
          loadComments(page + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMoreComments, commentsLoading, page]);

  const handleBlogFetch = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.append('blogId', blogId);
      if (userId) {
        params.append('userId', userId);
      }
      
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/blog/getBlog?${params.toString()}`;
      const res = await axios.get(url);
      
      setBlog(res.data);
      setIsLiked(res.data.liked);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching blog:", err);
      setLoading(false);
    }
  };

  const loadComments = async (pageNum: number) => {
    if (commentsLoading) return;
    
    try {
      setCommentsLoading(true);
      
      const params = new URLSearchParams();
      params.append('blogId', blogId);
      params.append('page', pageNum.toString());
      params.append('size', '10');
      if (userId) {
        params.append('userId', userId);
      }
      
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/like&comment/get-comments?${params.toString()}`;
      const res = await axios.get(url);
      const newComments = res.data.filter((comment: CommentResponse) => !comment.IsDeleted);
      
      if (newComments.length < 10) {
        setHasMoreComments(false);
      }
      
      setComments(prev => pageNum === 0 ? newComments : [...prev, ...newComments]);
      setPage(pageNum);
      setCommentsLoading(false);
    } catch (err) {
      console.error("Error loading comments:", err);
      setCommentsLoading(false);
    }
  };

  const toggleLike = async () => {
    if (!isAuthenticated || !userId) {
      setModalConfig({
        isOpen: true,
        message: "Please log in to like this blog",
        showAuthButtons: true
      });
      return;
    }

    try {
      const authToken = token;
      
      if (!authToken) {
        console.error('No auth token available');
        setModalConfig({
          isOpen: true,
          message: "Authentication error. Please log in again.",
          showAuthButtons: true
        });
        return;
      }

      if (isLiked) {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/like&comment/removeLike?blogId=${blogId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          }
        );
        setIsLiked(false);
        setBlog(blog ? { ...blog, likes: blog.likes - 1 } : null);
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/like&comment/like?blogId=${blogId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${authToken}`
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
      setModalConfig({
        isOpen: true,
        message: "Please log in to comment on this blog",
        showAuthButtons: true
      });
      return;
    }
    document.getElementById('comment-input')?.focus();
  };

  const addComment = async () => {
    if (!isAuthenticated || !userId) {
      setModalConfig({
        isOpen: true,
        message: "Please log in to comment",
        showAuthButtons: true
      });
      return;
    }

    if (!commentText.trim()) return;

    try {
      const authToken = token;
      
      if (!authToken) {
        console.error('No auth token available');
        return;
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/like&comment/create`,
        {
          blogId,
          content: commentText
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      
      setCommentText("");
      setBlog(blog ? { ...blog, comments: blog.comments + 1 } : null);
      setComments([]);
      setPage(0);
      setHasMoreComments(true);
      loadComments(0);
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const authToken = token;
      
      if (!authToken) {
        console.error('No auth token available');
        return;
      }

      setDeletingCommentId(commentId);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/like&comment/removeComment?commentId=${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      
      setComments(comments.filter(c => c.id !== commentId));
      setBlog(blog ? { ...blog, comments: blog.comments - 1 } : null);
      setDeletingCommentId(null);
      setOpenDropdown(null);
    } catch (err) {
      console.error("Error deleting comment:", err);
      setDeletingCommentId(null);
    }
  };

  const handleEdit = () => {
    router.push(`/edit-blog/${blogId}`);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this blog? This action cannot be undone.");
    
    if (!confirmDelete) return;

    try {
      const authToken = token;
      
      if (!authToken) {
        console.error('No auth token available');
        return;
      }

      setIsDeleting(true);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/blog/deleteBlog/${blogId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      alert("Blog deleted successfully!");
      router.push('/blogs');
    } catch (err) {
      console.error("Error deleting blog:", err);
      alert("Failed to delete blog. Please try again.");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-gray-600">Loading blog...</div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Blog not found</h2>
          <p className="text-gray-600 mb-6">The blog you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => router.push('/blogs')}
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
      <MessageModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        message={modalConfig.message}
        showAuthButtons={modalConfig.showAuthButtons}
      />
      
      <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 text-sm md:text-base"
        >
          <span>←</span>
          <span>Back</span>
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3" onClick={() => router.push(`/info/${blog.userId}`)}>
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

          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6">
            {blog.title}
          </h1>

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

          <div className="prose max-w-none mb-8">
            {blog.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

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

          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Comments</h3>
            <div className="flex gap-3">
              <input
                id="comment-input"
                type="text"
                placeholder={isAuthenticated ? "Write a comment..." : "Log in to comment..."}
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
                disabled={!isAuthenticated}
                className="flex-1 px-3 md:px-4 py-2 md:py-3 border rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={addComment}
                disabled={!isAuthenticated}
                className="px-4 md:px-6 py-2 md:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm md:text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {comments.length === 0 && !commentsLoading ? (
              <p className="text-center text-gray-500 py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <>
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                    <Image
                      src={comment.profilePic || "/default-avatar.png"}
                      alt={comment.username}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{comment.username}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        {comment.IsDeletable && isAuthenticated && (
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === comment.id ? null : comment.id)}
                              className="text-gray-600 hover:text-gray-800 p-1"
                            >
                              <span className="text-xl">⋮</span>
                            </button>
                            
                            {openDropdown === comment.id && (
                              <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg z-10">
                                <button
                                  onClick={() => deleteComment(comment.id)}
                                  disabled={deletingCommentId === comment.id}
                                  className="px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left text-sm disabled:opacity-50"
                                >
                                  {deletingCommentId === comment.id ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 mt-2">{comment.content}</p>
                    </div>
                  </div>
                ))}
                
                {commentsLoading && (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Loading more comments...</p>
                  </div>
                )}
                
                <div ref={observerTarget} className="h-4" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}