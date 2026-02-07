'use client';
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to BlogSpace
          </h1>
          <p className="text-lg md:text-2xl text-gray-600 mb-8 md:mb-12 max-w-3xl mx-auto px-4">
            Your platform to share stories, ideas, and connect with readers around the world
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => router.push('/blog-feed')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 md:px-10 md:py-4 rounded-lg font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
            >
              Read Blogs
            </button>
            <button
              onClick={() => router.push('/signup')}
              className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-3 md:px-10 md:py-4 rounded-lg font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-4 md:mb-6">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Create & Share</h3>
            <p className="text-sm md:text-base text-gray-600">
              Write and publish your blogs with ease. Add images, tags, and share your thoughts with the world.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-4 md:mb-6">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Discover Stories</h3>
            <p className="text-sm md:text-base text-gray-600">
              Explore diverse content from talented writers. Find blogs that inspire and educate you.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-4 md:mb-6">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Engage & Connect</h3>
            <p className="text-sm md:text-base text-gray-600">
              Like, comment, and interact with posts. Build a community around your interests.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl p-6 md:p-10 shadow-lg mb-12 md:mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-sm md:text-base text-gray-600">Active Writers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">5000+</div>
              <div className="text-sm md:text-base text-gray-600">Blog Posts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">10K+</div>
              <div className="text-sm md:text-base text-gray-600">Readers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">20K+</div>
              <div className="text-sm md:text-base text-gray-600">Comments</div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 md:mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold mx-auto mb-4 shadow-lg">
                1
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Create Account</h3>
              <p className="text-sm md:text-base text-gray-600 px-4">
                Sign up in seconds and set up your profile
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold mx-auto mb-4 shadow-lg">
                2
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Write Your Blog</h3>
              <p className="text-sm md:text-base text-gray-600 px-4">
                Create engaging content with our easy-to-use editor
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold mx-auto mb-4 shadow-lg">
                3
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Share & Engage</h3>
              <p className="text-sm md:text-base text-gray-600 px-4">
                Publish your work and connect with readers
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white shadow-xl">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Ready to Start Your Blogging Journey?</h2>
          <p className="text-base md:text-xl mb-6 md:mb-8 opacity-90">
            Join thousands of writers sharing their stories today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => router.push('/signup')}
              className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 md:px-10 md:py-4 rounded-lg font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
            >
              Get Started Free
            </button>
            <button
              onClick={() => router.push('/blog-feed')}
              className="bg-transparent hover:bg-white/10 text-white border-2 border-white px-8 py-3 md:px-10 md:py-4 rounded-lg font-semibold text-base md:text-lg transition-all duration-300 w-full sm:w-auto"
            >
              Explore Blogs
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 mt-12 md:mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 text-center text-sm md:text-base text-gray-600">
          <p>© 2024 BlogSpace. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}