import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const InteractionContext = createContext(null);

export const InteractionProvider = ({ children }) => {
  const { user } = useAuth();
  const [likedPostIds, setLikedPostIds] = useState(new Set());
  const [savedPostIds, setSavedPostIds] = useState(new Set());
  const [likesCountMap, setLikesCountMap] = useState({});
  const [commentsCountMap, setCommentsCountMap] = useState({});
  
  // Comment drawer states
  const [drawerPost, setDrawerPost] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Toast notification states
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToast(prev => {
        if (prev && prev.message === message) return null;
        return prev;
      });
    }, 3000);
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Fetch and cache authenticated user's likes and saves
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          // Fetch saved posts
          const response = await api.get('/users/saved-posts');
          const savedIds = response.data.map(p => p._id);
          setSavedPostIds(new Set(savedIds));

          // Also populate likes count and user liked status from saved posts
          const likedIds = [];
          const counts = {};
          const commentCounts = {};
          response.data.forEach(p => {
            const isLiked = p.likedBy && (
              Array.isArray(p.likedBy) 
                ? p.likedBy.some(id => (id._id || id) === user._id)
                : p.likedBy === user._id
            );
            if (isLiked) {
              likedIds.push(p._id);
            }
            counts[p._id] = p.likesCount ?? 0;
            commentCounts[p._id] = p.commentsCount ?? 0;
          });
          
          setLikedPostIds(prev => new Set([...prev, ...likedIds]));
          setLikesCountMap(prev => ({ ...prev, ...counts }));
          setCommentsCountMap(prev => ({ ...prev, ...commentCounts }));
        } catch (error) {
          console.error('Failed to prefetch saved posts:', error);
        }
      } else {
        setSavedPostIds(new Set());
        setLikedPostIds(new Set());
        setLikesCountMap({});
        setCommentsCountMap({});
      }
    };

    fetchUserData();
  }, [user]);

  // Register post details when a card is rendered to seed the cache
  const registerPost = useCallback((post) => {
    if (!post) return;
    const postId = post._id;

    // Cache likes count
    setLikesCountMap(prev => {
      if (postId in prev) return prev;
      return { ...prev, [postId]: post.likesCount ?? 0 };
    });

    // Cache comments count
    setCommentsCountMap(prev => {
      if (postId in prev) return prev;
      return { ...prev, [postId]: post.commentsCount ?? 0 };
    });

    // Cache liked state
    setLikedPostIds(prev => {
      if (prev.has(postId)) return prev;
      const next = new Set(prev);
      const isLiked = post.likedBy && user && (
        Array.isArray(post.likedBy)
          ? post.likedBy.some(id => (id._id || id) === user._id)
          : post.likedBy === user._id
      );
      if (isLiked) {
        next.add(postId);
      }
      return next;
    });
  }, [user]);

  // Toggle Like with Optimistic Updates
  const toggleLike = useCallback(async (post) => {
    if (!user) {
      showToast('Please log in to like posts', 'error');
      return;
    }
    const postId = post._id;
    const currentlyLiked = likedPostIds.has(postId);
    const currentCount = likesCountMap[postId] ?? post.likesCount ?? 0;

    // Optimistic Update
    setLikedPostIds(prev => {
      const next = new Set(prev);
      if (currentlyLiked) next.delete(postId);
      else next.add(postId);
      return next;
    });
    setLikesCountMap(prev => ({
      ...prev,
      [postId]: currentlyLiked ? Math.max(0, currentCount - 1) : currentCount + 1
    }));

    try {
      const response = await api.post(`/posts/${postId}/like`);
      // Sync with server values
      setLikesCountMap(prev => ({
        ...prev,
        [postId]: response.data.likesCount
      }));
      setLikedPostIds(prev => {
        const next = new Set(prev);
        if (response.data.liked) next.add(postId);
        else next.delete(postId);
        return next;
      });
    } catch (error) {
      // Revert on failure
      setLikedPostIds(prev => {
        const next = new Set(prev);
        if (currentlyLiked) next.add(postId);
        else next.delete(postId);
        return next;
      });
      setLikesCountMap(prev => ({
        ...prev,
        [postId]: currentCount
      }));
      showToast('Failed to update like. Please try again.', 'error');
    }
  }, [user, likedPostIds, likesCountMap, showToast]);

  // Toggle Save with Optimistic Updates
  const toggleSave = useCallback(async (post) => {
    if (!user) {
      showToast('Please log in to save posts', 'error');
      return;
    }
    const postId = post._id;
    const currentlySaved = savedPostIds.has(postId);

    // Optimistic Update
    setSavedPostIds(prev => {
      const next = new Set(prev);
      if (currentlySaved) next.delete(postId);
      else next.add(postId);
      return next;
    });

    try {
      const response = await api.post(`/posts/${postId}/save`);
      showToast(response.data.saved ? 'Pin saved to your board!' : 'Pin unsaved', 'success');
      setSavedPostIds(prev => {
        const next = new Set(prev);
        if (response.data.saved) next.add(postId);
        else next.delete(postId);
        return next;
      });
    } catch (error) {
      // Revert on failure
      setSavedPostIds(prev => {
        const next = new Set(prev);
        if (currentlySaved) next.add(postId);
        else next.delete(postId);
        return next;
      });
      showToast('Failed to save pin. Please try again.', 'error');
    }
  }, [user, savedPostIds, showToast]);

  // Comment Drawer controls
  const openCommentDrawer = useCallback((post) => {
    setDrawerPost(post);
    setIsDrawerOpen(true);
  }, []);

  const closeCommentDrawer = useCallback(() => {
    setDrawerPost(null);
    setIsDrawerOpen(false);
  }, []);

  const updateCommentsCount = useCallback((postId, delta) => {
    setCommentsCountMap(prev => ({
      ...prev,
      [postId]: Math.max(0, (prev[postId] ?? 0) + delta)
    }));
  }, []);

  return (
    <InteractionContext.Provider
      value={{
        likedPostIds,
        savedPostIds,
        likesCountMap,
        commentsCountMap,
        drawerPost,
        isDrawerOpen,
        toast,
        showToast,
        dismissToast,
        registerPost,
        toggleLike,
        toggleSave,
        openCommentDrawer,
        closeCommentDrawer,
        updateCommentsCount
      }}
    >
      {children}
    </InteractionContext.Provider>
  );
};

export const useInteraction = () => {
  const context = useContext(InteractionContext);
  if (!context) {
    throw new Error('useInteraction must be used within an InteractionProvider');
  }
  return context;
};
