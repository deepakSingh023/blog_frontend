'use client';
import Image from "next/image";
import { useState } from "react";

interface Blog {
  id: string;
  title: string;
  content: string;
  image: string | null;
  tags: string[];
  date: string;
}

export default function Profile() {
  const [blogs, setBlogs] = useState([]);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  
  const [profileImage, setProfileImage] = useState("/Untitled.jpeg");
  const [bio, setBio] = useState("Hi, I am John Doe, owner of this profile.");
  
  const [blogTitle, setBlogTitle] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogImage, setBlogImage] = useState(null);
  const [blogTags, setBlogTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  
  const [tempBio, setTempBio] = useState(bio);
  const [tempProfileImage, setTempProfileImage] = useState(null);

  const handleImageUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        type === 'blog' ? setBlogImage(reader.result) : setTempProfileImage(reader.result);
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

  const removeTag = (tag) => setBlogTags(blogTags.filter(t => t !== tag));

  const saveBlog = () => {
    if (!blogTitle || !blogContent) return;
    
    if (editingBlog) {
      setBlogs(blogs.map(b => b.id === editingBlog.id 
        ? { ...b, title: blogTitle, content: blogContent, image: blogImage, tags: blogTags }
        : b
      ));
    } else {
      setBlogs([...blogs, {
        id: Date.now(),
        title: blogTitle,
        content: blogContent,
        image: blogImage,
        tags: blogTags,
        date: new Date().toLocaleDateString()
      }]);
    }
    closeModal();
  };

  const editBlog = (blog) => {
    setEditingBlog(blog);
    setBlogTitle(blog.title);
    setBlogContent(blog.content);
    setBlogImage(blog.image);
    setBlogTags(blog.tags);
    setShowBlogModal(true);
  };

  const deleteBlog = (id) => {
    if (confirm("Delete this blog?")) {
      setBlogs(blogs.filter(b => b.id !== id));
    }
  };

  const saveProfile = () => {
    setBio(tempBio);
    if (tempProfileImage) setProfileImage(tempProfileImage);
    setShowProfileModal(false);
    setTempProfileImage(null);
  };

  const closeModal = () => {
    setBlogTitle("");
    setBlogContent("");
    setBlogImage(null);
    setBlogTags([]);
    setCurrentTag("");
    setEditingBlog(null);
    setShowBlogModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-4 md:py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8">
            <Image
              src={profileImage}
              alt="Profile"
              width={100}
              height={100}
              className="rounded-full object-cover w-24 h-24 md:w-28 md:h-28"
            />
            <div className="flex-1 text-center md:text-left w-full">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">John Doe</h1>
              <p className="text-gray-600 mb-4 text-sm md:text-base">{bio}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <button 
                  onClick={() => setShowProfileModal(true)}
                  className="bg-gray-200 hover:bg-gray-300 px-5 py-2 rounded-lg font-semibold text-sm md:text-base"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={() => setShowBlogModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold text-sm md:text-base"
                >
                  Create New Blog
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Blogs */}
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">My Blogs</h2>
        
        {blogs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 md:p-16 text-center">
            <div className="inline-block p-4 md:p-6 rounded-full bg-gray-100 mb-4">
              <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">No blogs yet</h3>
            <p className="text-gray-500 text-sm md:text-base">Start sharing your thoughts by creating your first blog post.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {blogs.map((blog) => (
              <div key={blog.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {blog.image && (
                  <div className="relative h-40 md:h-48 w-full">
                    <Image src={blog.image} alt={blog.title} fill className="object-cover" />
                  </div>
                )}
                <div className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold mb-2">{blog.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3 text-sm md:text-base">{blog.content}</p>
                  {blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {blog.tags.map((tag, i) => (
                        <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs md:text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-xs md:text-sm text-gray-500">{blog.date}</span>
                    <div className="flex gap-2">
                      <button onClick={() => editBlog(blog)} className="text-blue-500 hover:text-blue-600 font-semibold text-xs md:text-sm">
                        Edit
                      </button>
                      <button onClick={() => deleteBlog(blog.id)} className="text-red-500 hover:text-red-600 font-semibold text-xs md:text-sm">
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

      {/* Blog Modal */}
      {showBlogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
              <button onClick={closeModal} className="text-sm font-semibold text-gray-600">Cancel</button>
              <h2 className="font-semibold text-base md:text-lg">{editingBlog ? 'Edit Blog' : 'Create Blog'}</h2>
              <button onClick={saveBlog} disabled={!blogTitle || !blogContent} className="text-sm font-semibold text-blue-500 disabled:text-blue-300">
                {editingBlog ? 'Update' : 'Create'}
              </button>
            </div>
            <div className="p-4 md:p-6">
              {!blogImage ? (
                <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 md:p-12 text-center cursor-pointer hover:bg-gray-50 mb-6">
                  <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs md:text-sm text-gray-600">Upload cover image (optional)</span>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'blog')} className="hidden" />
                </label>
              ) : (
                <div className="relative mb-6">
                  <Image src={blogImage} alt="Preview" width={600} height={300} className="w-full rounded-xl object-cover max-h-48 md:max-h-64" />
                  <button onClick={() => setBlogImage(null)} className="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded-full p-2">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <div className="mb-4">
                <label className="block text-xs md:text-sm font-semibold mb-2">Title</label>
                <input type="text" placeholder="Enter blog title..." value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} className="w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg text-sm md:text-base" />
              </div>
              <div className="mb-4">
                <label className="block text-xs md:text-sm font-semibold mb-2">Content</label>
                <textarea placeholder="Write your blog..." value={blogContent} onChange={(e) => setBlogContent(e.target.value)} rows={8} className="w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg resize-none text-sm md:text-base" />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-semibold mb-2">Tags</label>
                <div className="flex gap-2 mb-3">
                  <input type="text" placeholder="Add tag..." value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} className="flex-1 px-3 md:px-4 py-2 border rounded-lg text-sm md:text-base" />
                  <button onClick={addTag} className="bg-gray-200 hover:bg-gray-300 px-4 md:px-6 py-2 rounded-lg font-semibold text-sm md:text-base">Add</button>
                </div>
                {blogTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {blogTags.map((tag, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs md:text-sm flex items-center gap-2">
                        #{tag}
                        <button onClick={() => removeTag(tag)} className="font-bold">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="border-b px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
              <button onClick={() => setShowProfileModal(false)} className="text-sm font-semibold text-gray-600">Cancel</button>
              <h2 className="font-semibold text-base md:text-lg">Edit Profile</h2>
              <button onClick={saveProfile} className="text-sm font-semibold text-blue-500">Done</button>
            </div>
            <div className="p-4 md:p-6">
              <div className="flex flex-col items-center mb-6">
                <Image src={tempProfileImage || profileImage} alt="Profile" width={100} height={100} className="rounded-full object-cover w-24 h-24 md:w-28 md:h-28 mb-3" />
                <label className="text-blue-500 font-semibold cursor-pointer hover:text-blue-600 text-sm md:text-base">
                  Change Photo
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'profile')} className="hidden" />
                </label>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-semibold mb-2">Bio</label>
                <textarea value={tempBio} onChange={(e) => setTempBio(e.target.value)} rows={4} className="w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg resize-none text-sm md:text-base" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}