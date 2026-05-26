import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, UploadCloud, Film, Image, AlertCircle, ArrowUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const UploadModal = ({ isOpen, onClose, onPostCreated }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Design');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileType, setFileType] = useState('image'); // 'image' or 'video'
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      
      if (selectedFile.type.startsWith('video/')) {
        setFileType('video');
      } else {
        setFileType('image');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const selectedFile = e.dataTransfer.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      if (selectedFile.type.startsWith('video/')) {
        setFileType('video');
      } else {
        setFileType('image');
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select an image or video to upload');
      return;
    }

    if (!title) {
      setError('Please enter a title');
      return;
    }

    if (!description) {
      setError('Please enter a description');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('media', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);

      // Perform upload
      await api.post('/posts/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      setLoading(false);
      
      // Reset form states
      setTitle('');
      setDescription('');
      setCategory('Design');
      setFile(null);
      setPreviewUrl('');
      
      if (onPostCreated) {
        onPostCreated();
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create post. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      ></motion.div>

      {/* Modal Centering Wrapper */}
      <div 
        onClick={onClose}
        className="flex min-h-full justify-center p-4"
      >
        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 my-auto w-full max-w-4xl max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden rounded-pinterest-large bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-150 dark:border-zinc-800 px-6 py-4 shrink-0">
            <h2 className="font-sans text-xl font-bold text-brand-dark dark:text-white">Create a Pin</h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-brand-gray dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              
              {/* Left Pane: Media Dropzone */}
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="relative flex flex-col items-center justify-center min-h-[300px] md:min-h-[350px] rounded-pinterest border-2 border-dashed border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800/50 p-6 transition-all hover:border-brand-red"
              >
                {previewUrl ? (
                  <div className="relative h-full w-full rounded-xl overflow-hidden group">
                    {fileType === 'video' ? (
                      <video 
                        src={previewUrl} 
                        controls 
                        className="h-full max-h-[350px] w-full object-contain rounded-xl"
                      />
                    ) : (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="h-full max-h-[350px] w-full object-contain rounded-xl"
                      />
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center text-center cursor-pointer p-4 hover:scale-101 transition-transform"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30 text-brand-red dark:text-red-400">
                      <UploadCloud className="h-8 w-8 animate-bounce" />
                    </div>
                    <p className="mt-4 font-sans text-sm font-semibold text-brand-dark dark:text-gray-200">
                      Drag and drop or click to upload
                    </p>
                    <p className="mt-2 font-sans text-xs text-brand-gray dark:text-zinc-400">
                      We recommend high-quality images (.jpg, .png, .webp) or videos (.mp4) under 50MB.
                    </p>
                    <div className="mt-6 flex gap-4 text-xs font-semibold text-brand-gray dark:text-zinc-400">
                      <span className="flex items-center gap-1"><Image className="h-4 w-4" /> Images</span>
                      <span className="flex items-center gap-1"><Film className="h-4 w-4" /> Videos</span>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Right Pane: Post Details */}
              <div className="flex flex-col justify-between space-y-6">
                
                {/* Creator Card */}
                <div className="flex items-center gap-3">
                  <img
                    src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=default'}
                    alt={user?.username}
                    className="h-9 w-9 rounded-full border border-brand-red/80 bg-gray-50 object-cover"
                  />
                  <div>
                    <p className="font-sans text-sm font-bold text-brand-dark dark:text-white">{user?.username}</p>
                    <p className="font-sans text-xs text-brand-gray dark:text-zinc-400">Creating inspiration</p>
                  </div>
                </div>

                {/* Title input */}
                <div>
                  <label className="text-xs font-bold text-brand-dark dark:text-zinc-400 uppercase tracking-wider">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Add a catchy title"
                    className="mt-2 block w-full border-b border-gray-200 dark:border-zinc-700 bg-transparent py-2.5 font-sans text-lg font-semibold text-brand-dark dark:text-white placeholder-gray-300 dark:placeholder-zinc-500 focus:border-brand-red focus:outline-none transition-colors"
                  />
                </div>

                {/* Description input */}
                <div>
                  <label className="text-xs font-bold text-brand-dark dark:text-zinc-400 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your Pin: what is it about? What details stand out?"
                    className="mt-2 block w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3 font-sans text-sm text-brand-dark dark:text-white placeholder-gray-300 dark:placeholder-zinc-500 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red transition-all"
                  />
                </div>

                {/* Category selector */}
                <div>
                  <label className="text-xs font-bold text-brand-dark dark:text-zinc-400 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3 font-sans text-sm text-brand-dark dark:text-white focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                  >
                    <option value="Design" className="dark:bg-zinc-800">Design</option>
                    <option value="Photography" className="dark:bg-zinc-800">Photography</option>
                    <option value="Art" className="dark:bg-zinc-800">Art</option>
                    <option value="Nature" className="dark:bg-zinc-800">Nature</option>
                    <option value="Travel" className="dark:bg-zinc-800">Travel</option>
                    <option value="Quotes" className="dark:bg-zinc-800">Quotes</option>
                    <option value="Fashion" className="dark:bg-zinc-800">Fashion</option>
                    <option value="Architecture" className="dark:bg-zinc-800">Architecture</option>
                  </select>
                </div>

                {/* Publish button */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-pinterest bg-brand-red px-6 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span>Uploading {uploadProgress}%</span>
                      </div>
                    ) : (
                      <>
                        Publish <ArrowUp className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>

          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadModal;
