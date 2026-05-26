import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Trash2, MessageSquare, AlertCircle } from 'lucide-react';
import { useInteraction } from '../context/InteractionContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const CommentDrawer = () => {
  const { user } = useAuth();
  const { isDrawerOpen, drawerPost, closeCommentDrawer, showToast, updateCommentsCount } = useInteraction();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);

  const listRef = useRef(null);
  const bottomRef = useRef(null);

  // Fetch comments
  const fetchComments = async (pageNum = 1, isNew = false) => {
    if (!drawerPost) return;
    try {
      setLoading(true);
      const response = await api.get(`/comments/${drawerPost._id}`, {
        params: { page: pageNum, limit: 15 }
      });
      const { comments: newComments, pages, total } = response.data;
      
      if (isNew) {
        setComments(newComments);
      } else {
        setComments(prev => [...prev, ...newComments]);
      }
      setHasMore(pageNum < pages);
      setCommentsCount(total);
    } catch (error) {
      console.error(error);
      showToast('Failed to load comments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDrawerOpen && drawerPost) {
      setPage(1);
      fetchComments(1, true);
    } else {
      setComments([]);
    }
  }, [isDrawerOpen, drawerPost]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || loading || !isDrawerOpen) return;
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage(prev => {
          const next = prev + 1;
          fetchComments(next, false);
          return next;
        });
      }
    }, { threshold: 0.1 });

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => {
      if (bottomRef.current) {
        observer.unobserve(bottomRef.current);
      }
    };
  }, [hasMore, loading, isDrawerOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    try {
      setSending(true);
      const response = await api.post(`/comments/${drawerPost._id}`, { text });
      
      setComments(prev => [...prev, response.data]);
      setText('');
      setCommentsCount(prev => prev + 1);
      updateCommentsCount(drawerPost._id, 1);
      
      // Scroll to bottom of comments list
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit comment', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
      setCommentsCount(prev => Math.max(0, prev - 1));
      updateCommentsCount(drawerPost._id, -1);
      showToast('Comment deleted');
    } catch (error) {
      showToast('Failed to delete comment', 'error');
    }
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && drawerPost && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCommentDrawer}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white dark:bg-zinc-900 shadow-2xl border-l border-gray-100 dark:border-zinc-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 px-6 py-4">
              <div>
                <h3 className="font-sans text-lg font-bold text-brand-dark dark:text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-brand-gray dark:text-zinc-400" /> Comments ({commentsCount})
                </h3>
                <p className="font-sans text-xs text-brand-gray dark:text-zinc-400 truncate max-w-[250px] mt-0.5">
                  on "{drawerPost.title}"
                </p>
              </div>
              <button
                onClick={closeCommentDrawer}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-brand-gray dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Comments List */}
            <div 
              ref={listRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar"
            >
              {comments.length > 0 ? (
                <>
                  {comments.map((comment) => (
                    <div key={comment._id} className="flex items-start gap-3 group">
                      <img
                        src={comment.user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=default'}
                        alt={comment.user?.username}
                        className="h-8 w-8 rounded-full object-cover border border-brand-red/80 bg-gray-55 dark:bg-zinc-800 shrink-0"
                      />
                      <div className="flex-1 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 p-3 relative">
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-xs font-bold text-brand-dark dark:text-gray-200">
                            {comment.user?.username}
                          </span>
                          <span className="font-sans text-[10px] text-brand-gray dark:text-zinc-400">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="font-sans text-sm text-brand-dark dark:text-gray-100 mt-1 whitespace-pre-wrap break-words leading-relaxed">
                          {comment.text}
                        </p>
                        
                        {/* Delete own comment button */}
                        {user && comment.user && (comment.user._id === user._id || comment.user === user._id) && (
                          <button
                            onClick={() => handleDelete(comment._id)}
                            className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity p-1 rounded-lg hover:bg-red-55 dark:hover:bg-red-950/20"
                            title="Delete comment"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Infinite scroll anchor */}
                  {hasMore && <div ref={bottomRef} className="h-8" />}
                </>
              ) : (
                !loading && (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-brand-gray dark:text-zinc-400">
                    <MessageSquare className="h-10 w-10 stroke-1 mb-3" />
                    <p className="font-sans text-sm font-semibold">No comments yet</p>
                    <p className="font-sans text-xs max-w-xs mt-1">Be the first to share your thoughts on this pin!</p>
                  </div>
                )
              )}

              {/* Skeletons on loading page 1 */}
              {loading && page === 1 && (
                <div className="space-y-4">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="flex gap-3 animate-pulse">
                      <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-zinc-800" />
                      <div className="flex-1 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 p-4 space-y-2">
                        <div className="h-3 w-20 bg-gray-200 dark:bg-zinc-700 rounded" />
                        <div className="h-4 w-full bg-gray-200 dark:bg-zinc-700 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Input */}
            <div className="border-t border-gray-100 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900">
              {user ? (
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                  <img
                    src={user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=default'}
                    alt={user.username}
                    className="h-8 w-8 rounded-full object-cover border border-brand-red/80 bg-gray-50 dark:bg-zinc-800 shrink-0"
                  />
                  <div className="relative flex-1 flex items-center">
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full rounded-full border border-gray-200 dark:border-zinc-700 bg-gray-55 dark:bg-zinc-800 pl-4 pr-10 py-2.5 font-sans text-sm text-brand-dark dark:text-white placeholder-brand-gray dark:placeholder-zinc-400 outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!text.trim() || sending}
                      className="absolute right-2 text-brand-red hover:text-red-700 disabled:text-gray-300 dark:disabled:text-zinc-600 transition-colors p-1.5 cursor-pointer"
                    >
                      {sending ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-red border-t-transparent" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="rounded-xl bg-gray-50 dark:bg-zinc-800 p-3 text-center text-xs font-semibold text-brand-gray dark:text-zinc-400 flex items-center justify-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Please log in to add comments
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommentDrawer;
