'use client';
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Comment {
  id: number;
  author: string;
  authorImage: string;
  content: string;
  date: string;
}

interface Blog {
  id: number;
  title: string;
  content: string;
  image: string;
  author: string;
  authorImage: string;
  date: string;
  likes: number;
  comments: Comment[];
}

export default function BlogFeed() {
  const router = useRouter();
  
  const [blogs, setBlogs] = useState<Blog[]>([
    {
      id: 1,
      title: "Getting Started with Next.js 14",
      content: "Next.js 14 introduces powerful features that make building web applications easier than ever. From improved performance to better developer experience, this version brings a lot to the table. The new App Router provides a more intuitive way to structure your applications, while Server Components help reduce the amount of JavaScript sent to the client...",
      image: "/Untitled.jpeg",
      author: "Sarah Johnson",
      authorImage: "/Untitled.jpeg",
      date: "2 days ago",
      likes: 124,
      comments: [
        {
          id: 1,
          author: "Mike Chen",
          authorImage: "/Untitled.jpeg",
          content: "Great article! Very helpful for understanding the new features.",
          date: "1 day ago"
        },
        {
          id: 2,
          author: "Emma Wilson",
          authorImage: "/Untitled.jpeg",
          content: "Thanks for sharing this. The App Router section was particularly useful.",
          date: "1 day ago"
        }
      ]
    },
    {
      id: 2,
      title: "The Future of Web Development",
      content: "As we move forward into 2024, web development continues to evolve at a rapid pace. New frameworks, tools, and methodologies are emerging that promise to make our lives as developers easier and our applications more performant. Let's explore what the future holds for web development and how we can prepare ourselves...",
      image: "/Untitled.jpeg",
      author: "John Doe",
      authorImage: "/Untitled.jpeg",
      date: "5 days ago",
      likes: 89,
      comments: []
    },
    {
      id: 3,
      title: "Mastering Tailwind CSS",
      content: "Tailwind CSS has revolutionized the way we style our web applications. Instead of writing custom CSS, we can now use utility classes to build beautiful, responsive designs quickly. In this post, we'll dive deep into advanced Tailwind techniques that will take your styling skills to the next level...",
      image: "/Untitled.jpeg",
      author: "Lisa Anderson",
      authorImage: "/Untitled.jpeg",
      date: "1 week ago",
      likes: 203,
      comments: [
        {
          id: 1,
          author: "David Lee",
          authorImage: "/Untitled.jpeg",
          content: "Tailwind is amazing! This guide helped me understand it better.",
          date: "6 days ago"
        }
      ]
    }
  ]);

  const [likedBlogs, setLikedBlogs] = useState<Set<number>>(new Set());
  const [showComments, setShowComments] = useState<Set<number>>(new Set());
  const [commentText, setCommentText] = useState<{ [key: number]: string }>({});

  const toggleLike = (blogId: number) => {
    const newLikedBlogs = new Set(likedBlogs);
    const newBlogs = blogs.map(blog => {
      if (blog.id === blogId) {
        if (likedBlogs.has(blogId)) {
          newLikedBlogs.delete(blogId);
          return { ...blog, likes: blog.likes - 1 };
        } else {
          newLikedBlogs.add(blogId);
          return { ...blog, likes: blog.likes + 1 };
        }
      }
      return blog;
    });
    setLikedBlogs(newLikedBlogs);
    setBlogs(newBlogs);
  };

  const toggleComments = (blogId: number) => {
    const newShowComments = new Set(showComments);
    if (showComments.has(blogId)) {
      newShowComments.delete(blogId);
    } else {
      newShowComments.add(blogId);
    }
    setShowComments(newShowComments);
  };

  const addComment = (blogId: number) => {
    const comment = commentText[blogId]?.trim();
    if (!comment) return;

    const newBlogs = blogs.map(blog => {
      if (blog.id === blogId) {
        return {
          ...blog,
          comments: [
            ...blog.comments,
            {
              id: Date.now(),
              author: "Current User",
              authorImage: "/Untitled.jpeg",
              content: comment,
              date: "Just now"
            }
          ]
        };
      }
      return blog;
    });

    setBlogs(newBlogs);
    setCommentText({ ...commentText, [blogId]: "" });
  };

  const navigateToBlog = (blogId: number) => {
    router.push(`/blogs/${blogId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-4 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Blog Feed</h1>
        
        <div className="space-y-6">
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Author Info */}
              <div className="p-4 md:p-6 flex items-center gap-3">
                <Image
                  src={blog.authorImage}
                  alt={blog.author}
                  width={40}
                  height={40}
                  className="rounded-full object-cover w-10 h-10"
                />
                <div>
                  <h3 className="font-semibold text-sm md:text-base">{blog.author}</h3>
                  <p className="text-xs md:text-sm text-gray-500">{blog.date}</p>
                </div>
              </div>

              {/* Blog Content */}
              <div 
                onClick={() => navigateToBlog(blog.id)}
                className="cursor-pointer"
              >
                <div className="px-4 md:px-6 pb-4">
                  <h2 className="text-xl md:text-2xl font-bold mb-3">{blog.title}</h2>
                </div>

                {/* Blog Image */}
                <div className="relative w-full h-48 md:h-64 lg:h-80">
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Blog Excerpt */}
                <div className="p-4 md:p-6">
                  <p className="text-gray-700 text-sm md:text-base line-clamp-3 mb-2">
                    {blog.content}
                  </p>
                  <button className="text-blue-500 hover:text-blue-600 font-semibold text-sm md:text-base">
                    Read more
                  </button>
                </div>
              </div>

              {/* Like and Comment Buttons */}
              <div className="px-4 md:px-6 pb-4 border-t pt-3">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => toggleLike(blog.id)}
                    className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                  >
                    <svg
                      className={`w-5 h-5 md:w-6 md:h-6 ${
                        likedBlogs.has(blog.id) ? 'fill-red-500 text-red-500' : 'fill-none text-gray-600'
                      }`}
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span className="text-sm md:text-base font-semibold text-gray-700">
                      {blog.likes}
                    </span>
                  </button>

                  <button
                    onClick={() => toggleComments(blog.id)}
                    className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                  >
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span className="text-sm md:text-base font-semibold text-gray-700">
                      {blog.comments.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {showComments.has(blog.id) && (
                <div className="px-4 md:px-6 pb-4 md:pb-6 border-t pt-4">
                  {/* Comment Input */}
                  <div className="mb-4">
                    <div className="flex gap-2 md:gap-3">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText[blog.id] || ""}
                        onChange={(e) =>
                          setCommentText({ ...commentText, [blog.id]: e.target.value })
                        }
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addComment(blog.id);
                          }
                        }}
                        className="flex-1 px-3 md:px-4 py-2 border rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => addComment(blog.id)}
                        disabled={!commentText[blog.id]?.trim()}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 md:px-6 py-2 rounded-lg font-semibold text-sm md:text-base"
                      >
                        Post
                      </button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {blog.comments.length === 0 ? (
                      <p className="text-gray-500 text-center py-4 text-sm md:text-base">
                        No comments yet. Be the first to comment!
                      </p>
                    ) : (
                      blog.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Image
                            src={comment.authorImage}
                            alt={comment.author}
                            width={32}
                            height={32}
                            className="rounded-full object-cover w-8 h-8 shrink-0"
                          />
                          <div className="flex-1 bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm md:text-base">
                                {comment.author}
                              </span>
                              <span className="text-xs text-gray-500">{comment.date}</span>
                            </div>
                            <p className="text-gray-700 text-sm md:text-base">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}