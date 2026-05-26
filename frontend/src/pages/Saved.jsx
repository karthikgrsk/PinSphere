import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import PostCard from '../components/PostCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { Bookmark, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInteraction } from '../context/InteractionContext';
import { Navigate, Link } from 'react-router-dom';

const Saved = () => {
  const { user, updateUser, loading: authLoading } = useAuth();
  const { showToast } = useInteraction();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/users/saved-posts');
      setPosts(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch saved posts');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Avatar image must be under 5MB', 'error');
      return;
    }

    try {
      setAvatarUploading(true);
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.put('/auth/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      updateUser(response.data);
      showToast('Profile picture updated successfully!');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update profile picture', 'error');
    } finally {
      setAvatarUploading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSavedPosts();
    }
  }, [user]);

  if (authLoading) {
    return <SkeletonLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="mb-10 flex flex-col items-center justify-center text-center animate-fade-in">
        
        {/* Profile Avatar with Edit Overlay */}
        <div className="relative group cursor-pointer overflow-hidden rounded-full border-2 border-brand-red shadow-sm h-20 w-20">
          <img
            src={user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=default'}
            alt={user.username}
            className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-200"
          />
          {avatarUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
              <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Edit</span>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />

        <h2 className="mt-4 font-sans text-2xl font-bold text-brand-dark dark:text-white">{user.username}</h2>
        <p className="font-sans text-xs text-brand-gray dark:text-zinc-400 mt-1">{user.email}</p>
        
        <div className="mt-6 flex items-center gap-2 rounded-full bg-brand-lightGray dark:bg-zinc-800 px-5 py-2.5 text-xs font-bold text-brand-dark dark:text-gray-200 uppercase tracking-wider">
          <Bookmark className="h-4 w-4 fill-brand-dark dark:fill-gray-200" />
          <span>Saved Pins</span>
        </div>
      </div>

      {error && (
        <div className="my-12 text-center text-red-500">
          <p className="font-semibold">{error}</p>
          <button 
            onClick={fetchSavedPosts}
            className="mt-4 rounded-full bg-brand-red px-6 py-2 text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Grid */}
      {posts.length > 0 ? (
        <div className="columns-2 gap-4 sm:columns-2 md:columns-3 lg:columns-3 xl:columns-4 [column-fill:_balance] box-border mx-auto">
          {posts.map((post, idx) => (
            <PostCard key={post._id || idx} post={post} />
          ))}
        </div>
      ) : (
        !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-900 text-brand-gray dark:text-zinc-400">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="mt-4 font-sans text-lg font-bold text-brand-dark dark:text-white">No saved pins yet</h3>
            <p className="mt-2 max-w-xs font-sans text-sm text-brand-gray dark:text-zinc-400 leading-relaxed">
              Explore the home feed and save pins you find inspiring to see them here!
            </p>
            <Link
              to="/"
              className="mt-6 rounded-full bg-brand-red px-6 py-3 text-sm font-bold text-white hover:bg-red-700 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Explore Feed
            </Link>
          </div>
        )
      )}

      {/* Loading Skeletons */}
      {loading && <SkeletonLoader />}
    </div>
  );
};

export default Saved;
