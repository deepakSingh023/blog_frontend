"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/redux/hook";
import { updateProfile, fetchProfile } from "@/app/redux/slices/ProfileSlice";
import {
  fetchBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  Blog,
} from "@/app/redux/slices/BlogSlice";
import CreateBlogModal from "@/app/components/CreateBlogModal";
import UpdateBlogModal from "@/app/components/UpdateBlogModal";

export default function Profile() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile.data);
  const blogs = useAppSelector((state) => state.blog.blogs);
  const blogLoading = useAppSelector((state) => state.blog.loading);

  const [showCreateBlogModal, setShowCreateBlogModal] = useState(false);
  const [showUpdateBlogModal, setShowUpdateBlogModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  const [tempBio, setTempBio] = useState("");
  const [tempProfileImageFile, setTempProfileImageFile] = useState<File | null>(null);
  const [tempProfileImagePreview, setTempProfileImagePreview] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchBlogs());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setTempBio(profile.bio || "");
    }
  }, [profile]);

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfileImageFile(file);
        setTempProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateBlog = async (data: {
    title: string;
    content: string;
    tags: string[];
    image: File;
  }) => {
    await dispatch(createBlog(data)).unwrap();
  };

  const handleUpdateBlog = async (data: {
    blogId: string;
    title: string;
    content: string;
    tags: string[];
    image?: File;
  }) => {
    await dispatch(updateBlog(data)).unwrap();
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlog(blog);
    setShowUpdateBlogModal(true);
  };

  const handleDeleteBlog = async (id: string) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      try {
        await dispatch(deleteBlog(id)).unwrap();
      } catch (error) {
        console.error("Failed to delete blog:", error);
        alert("Failed to delete blog. Please try again.");
      }
    }
  };

  const saveProfile = async () => {
    try {
      await dispatch(
        updateProfile({
          bio: tempBio,
          image: tempProfileImageFile || undefined,
        })
      ).unwrap();
      setShowProfileModal(false);
      setTempProfileImageFile(null);
      setTempProfileImagePreview(null);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setTempBio(profile?.bio || "");
    setTempProfileImageFile(null);
    setTempProfileImagePreview(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Image
              src={profile?.profilePic || "/Untitled.jpeg"}
              alt="Profile"
              width={120}
              height={120}
              className="rounded-full object-cover w-24 h-24 md:w-32 md:h-32"
            />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {profile?.username || "John Doe"}
              </h1>
              <p className="text-gray-600 text-sm md:text-base mb-4">
                {profile?.bio || "Hi, I am John Doe, owner of this profile."}
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="bg-gray-200 hover:bg-gray-300 px-5 py-2 rounded-lg font-semibold text-sm md:text-base transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setShowCreateBlogModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold text-sm md:text-base transition-colors"
                >
                  Create New Blog
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Blogs Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-6">My Blogs</h2>

          {blogLoading && (!blogs || blogs.length === 0) ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading blogs...</p>
            </div>
          ) : !blogs || blogs.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No blogs yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start sharing your thoughts by creating your first blog post.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {blog.image && (
                    <div className="relative h-40 md:h-48 w-full">
                      <Image
                        src={blog.image}
                        alt={blog.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 md:p-5">
                    <h3 className="text-lg md:text-xl font-bold mb-2 line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base mb-3 line-clamp-3">
                      {blog.content}
                    </p>

                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {blog.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-xs md:text-sm text-gray-500">
                        {formatDate(blog.createdAt)}
                      </span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEditBlog(blog)}
                          className="text-blue-500 hover:text-blue-600 font-semibold text-xs md:text-sm transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="text-red-500 hover:text-red-600 font-semibold text-xs md:text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Blog Modal */}
      <CreateBlogModal
        isOpen={showCreateBlogModal}
        onClose={() => setShowCreateBlogModal(false)}
        onSave={handleCreateBlog}
        loading={blogLoading}
      />

      {/* Update Blog Modal */}
      <UpdateBlogModal
        isOpen={showUpdateBlogModal}
        onClose={() => {
          setShowUpdateBlogModal(false);
          setEditingBlog(null);
        }}
        onUpdate={handleUpdateBlog}
        loading={blogLoading}
        blog={editingBlog}
      />

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="border-b px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
              <button
                onClick={closeProfileModal}
                className="text-sm font-semibold text-gray-600"
              >
                Cancel
              </button>
              <h2 className="font-semibold text-base md:text-lg">
                Edit Profile
              </h2>
              <button
                onClick={saveProfile}
                className="text-sm font-semibold text-blue-500"
              >
                Done
              </button>
            </div>
            <div className="p-4 md:p-6">
              <div className="flex flex-col items-center mb-6">
                <Image
                  src={
                    tempProfileImagePreview ||
                    profile?.profilePic ||
                    "/Untitled.jpeg"
                  }
                  alt="Profile"
                  width={100}
                  height={100}
                  className="rounded-full object-cover w-24 h-24 md:w-28 md:h-28 mb-3"
                />
                <label className="text-blue-500 font-semibold cursor-pointer hover:text-blue-600 text-sm md:text-base">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-semibold mb-2">
                  Bio
                </label>
                <textarea
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  rows={4}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg resize-none text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}