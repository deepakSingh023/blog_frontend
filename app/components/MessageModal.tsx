'use client';

import { useRouter } from "next/navigation";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  showAuthButtons?: boolean;
}

export default function MessageModal({ isOpen, onClose, message, showAuthButtons = false }: MessageModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <p className="text-gray-800 mb-6 text-center">{message}</p>
        
        {showAuthButtons ? (
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/auth/login')}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/auth/signup')}
              className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
            >
              Sign Up
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}