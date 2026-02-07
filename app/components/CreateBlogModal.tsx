"use client";
import Image from "next/image";
import { useState } from "react";

interface CreateBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    content: string;
    tags: string[];
    image: File;
  }) => Promise<void>;
  loading: boolean;
}

export default function CreateBlogModal({
  isOpen,
  onClose,
  onSave,
  loading,
}: CreateBlogModalProps) {
  const [blogTitle, setBlogTitle] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogImageFile, setBlogImageFile] = useState<File | null>(null);
  const [blogImagePreview, setBlogImagePreview] = useState<string | null>(null);
  const [blogTags, setBlogTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBlogImageFile(file);
        setBlogImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !blogTags.includes(currentTag.trim())) {
      setBlogTags([...blogTags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tag: string) =>
    setBlogTags(blogTags.filter((t) => t !== tag));

  const handleSave = async () => {
    if (!blogTitle || !blogContent || !blogImageFile) {
      alert("Please fill in all required fields including an image");
      return;
    }

    try {
      await onSave({
        title: blogTitle,
        content: blogContent,
        tags: blogTags,
        image: blogImageFile,
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to create blog:", error);
      alert("Failed to create blog. Please try again.");
    }
  };

  const resetForm = () => {
    setBlogTitle("");
    setBlogContent("");
    setBlogImageFile(null);
    setBlogImagePreview(null);
    setBlogTags([]);
    setCurrentTag("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-9999 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Fixed Header */}
        <div className="border-b px-4 md:px-6 py-3 md:py-4 flex items-center justify-between bg-white rounded-t-2xl shrink-0">
          <button
            onClick={handleClose}
            className="text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <h2 className="font-semibold text-base md:text-lg">Create Blog</h2>
          <button
            onClick={handleSave}
            disabled={loading}
            className="text-sm font-semibold text-blue-500 hover:text-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-4 md:p-6 space-y-4 md:space-y-6">
          <div>
            <label className="block text-xs md:text-sm font-semibold mb-2 text-gray-700">
              Cover Image *
            </label>
            {!blogImagePreview ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 md:p-12 cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all">
                <svg
                  className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-gray-600 text-sm md:text-base font-medium">
                  Click to upload cover image
                </span>
                <span className="text-gray-400 text-xs mt-1">
                  PNG, JPG, GIF up to 10MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative rounded-xl overflow-hidden">
                <Image
                  src={blogImagePreview}
                  alt="Blog preview"
                  width={600}
                  height={300}
                  className="w-full h-48 md:h-64 object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                <button
                  onClick={() => {
                    setBlogImageFile(null);
                    setBlogImagePreview(null);
                  }}
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full p-2 hover:bg-white transition-all shadow-lg"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <label className="absolute bottom-3 right-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-all shadow-lg">
                  Change Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs md:text-sm font-semibold mb-2 text-gray-700">
              Title *
            </label>
            <input
              type="text"
              placeholder="Enter an engaging title..."
              value={blogTitle}
              onChange={(e) => setBlogTitle(e.target.value)}
              className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-semibold mb-2 text-gray-700">
              Content *
            </label>
            <textarea
              placeholder="Write your story..."
              value={blogContent}
              onChange={(e) => setBlogContent(e.target.value)}
              rows={8}
              className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-xl resize-none text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-semibold mb-2 text-gray-700">
              Tags (Optional)
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add a tag..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="flex-1 px-3 md:px-4 py-2 border border-gray-300 rounded-xl text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                onClick={addTag}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 md:px-6 py-2 rounded-xl font-semibold text-sm md:text-base transition-all shadow-sm"
              >
                Add
              </button>
            </div>
            {blogTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blogTags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs md:text-sm flex items-center gap-2 font-medium"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}