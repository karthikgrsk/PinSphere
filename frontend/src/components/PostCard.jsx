import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, ExternalLink, Play, Volume2, VolumeX, Heart, MessageCircle } from 'lucide-react';
import { useInteraction } from '../context/InteractionContext';
import { useAuth } from '../context/AuthContext';

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const { 
    likedPostIds, 
    savedPostIds, 
    likesCountMap, 
    commentsCountMap, 
    toggleLike, 
    toggleSave, 
    openCommentDrawer,
    registerPost 
  } = useInteraction();

  const [hovered, setHovered] = useState(false);
  const [muted, setMuted] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const videoRef = useRef(null);

  // Register post to seed the interaction cache
  useEffect(() => {
    registerPost(post);
  }, [post, registerPost]);

  const isLiked = likedPostIds.has(post._id);
  const isSaved = savedPostIds.has(post._id);
  const likesCount = likesCountMap[post._id] ?? post.likesCount ?? 0;
  const commentsCount = commentsCountMap[post._id] ?? post.commentsCount ?? 0;

  const handleMouseEnter = () => {
    setHovered(true);
    if (post.mediaType === 'video' && videoRef.current) {
      videoRef.current.play().catch(() => console.log('Video autoplay blocked'));
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (post.mediaType === 'video' && videoRef.current) {
      videoRef.current.pause();
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    toggleLike(post);
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    toggleSave(post);
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    openCommentDrawer(post);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    const url = post.mediaUrl;
    const filename = post.title.toLowerCase().replace(/[^a-z0-9]/g, '_') + (post.mediaType === 'video' ? '.mp4' : '.jpg');
    
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const blobURL = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobURL;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobURL);
      })
      .catch(() => {
        window.open(url, '_blank');
      });
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="break-inside-avoid mb-6 group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative cursor-zoom-in overflow-hidden rounded-pinterest bg-gray-100/70 shadow-premium hover:shadow-premium-hover transition-all duration-300">
        
        {/* Loading shimmer placeholder */}
        {!imageLoaded && post.mediaType !== 'video' && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        )}

        {post.mediaType === 'video' ? (
          <div className="relative w-full overflow-hidden">
            <video
              ref={videoRef}
              src={post.mediaUrl}
              loop
              muted={muted}
              playsInline
              className="w-full object-cover rounded-xl"
              style={{ maxHeight: '480px' }}
            />
            {!hovered && (
              <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
                <Play className="h-4 w-4 fill-white" />
              </div>
            )}
            {hovered && (
              <button 
                onClick={toggleMute}
                className="absolute right-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:scale-115 transition-transform"
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            )}
          </div>
        ) : (
          <img
            src={post.mediaUrl}
            alt={post.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full object-cover rounded-xl transition-all duration-500 hover:scale-103 ${
              imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
            }`}
            style={{ maxHeight: '600px' }}
          />
        )}

        {/* Hover overlay content */}
        {hovered && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/60 via-black/10 to-black/30 p-3 text-white z-20"
          >
            {/* Top Row: Category and Save */}
            <div className="flex justify-between items-center w-full">
              <span className="rounded-full bg-black/40 border border-white/10 px-2 py-0.5 text-[10px] font-bold backdrop-blur-md">
                {post.category || 'General'}
              </span>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveClick}
                className={`rounded-full px-3.5 py-1.5 text-[11px] font-extrabold shadow transition-all cursor-pointer ${
                  isSaved 
                    ? 'bg-brand-dark text-white hover:bg-black' 
                    : 'bg-brand-red text-white hover:bg-red-700'
                }`}
              >
                {isSaved ? 'Saved' : 'Save'}
              </motion.button>
            </div>

            {/* Bottom Row: Actions */}
            <div className="flex justify-between items-center w-full">
              {/* Media downloads */}
              <div className="flex gap-2">
                <button 
                  onClick={handleDownload}
                  title="Download Media"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand-dark shadow hover:scale-110 active:scale-95 transition-all cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
                <a 
                  href={post.mediaUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand-dark shadow hover:scale-110 active:scale-95 transition-all"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Post details & socials below card */}
      <div className="mt-2.5 px-1 pb-1">
        <h3 className="font-sans text-sm font-bold text-brand-dark dark:text-white leading-tight line-clamp-1">
          {post.title}
        </h3>
        <p className="font-sans text-xs text-brand-gray dark:text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
          {post.description}
        </p>
        
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <img 
              src={post.user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=default'} 
              alt={post.user?.username || 'user'} 
              className="h-7 w-7 rounded-full border border-brand-red/80 bg-gray-50 object-cover shrink-0"
            />
            <span className="font-sans text-xs font-bold text-brand-dark dark:text-zinc-200 hover:text-brand-red dark:hover:text-brand-red hover:underline cursor-pointer truncate">
              {post.user?.username || 'anonymous'}
            </span>
          </div>

          {/* Socials Counters */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button 
              onClick={handleLikeClick}
              className="flex items-center gap-1 text-brand-gray hover:text-brand-dark dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
              title="Like"
            >
              <Heart className={`h-4 w-4 transition-colors ${isLiked ? 'fill-brand-red text-brand-red' : 'text-brand-gray'}`} />
              <span className="text-xs font-bold">{likesCount}</span>
            </button>

            <button 
              onClick={handleCommentClick}
              className="flex items-center gap-1 text-brand-gray hover:text-brand-dark dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
              title="Comment"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs font-bold">{commentsCount}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
