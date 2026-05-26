import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import PostCard from '../components/PostCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { Sparkles, Compass } from 'lucide-react';

const CATEGORIES = ['All', 'Design', 'Photography', 'Art', 'Nature', 'Travel', 'Quotes', 'Fashion', 'Architecture'];

const Home = ({ searchQuery }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const bottomRef = useRef(null);

  // Fetch posts helper
  const fetchPosts = async (pageNum = 1, isNewQuery = false) => {
    try {
      setLoading(true);
      setError('');
      
      let url = '/posts';
      let params = { page: pageNum, limit: 12 };

      if (searchQuery) {
        url = '/posts/search';
        params.q = searchQuery;
      } else if (selectedCategory && selectedCategory !== 'All') {
        url = '/posts/search';
        params.q = selectedCategory;
      }

      const response = await api.get(url, { params });
      const { posts: newPosts, pages } = response.data;

      if (isNewQuery) {
        setPosts(newPosts);
      } else {
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p._id));
          const filteredNew = newPosts.filter(p => !existingIds.has(p._id));
          return [...prev, ...filteredNew];
        });
      }

      setHasMore(pageNum < pages);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when search or category changes (reset page)
  useEffect(() => {
    setPage(1);
    fetchPosts(1, true);
  }, [searchQuery, selectedCategory]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prevPage => {
            const nextPage = prevPage + 1;
            fetchPosts(nextPage, false);
            return nextPage;
          });
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => {
      if (bottomRef.current) {
        observer.unobserve(bottomRef.current);
      }
    };
  }, [hasMore, loading]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Category Slider */}
      {!searchQuery && (
        <div className="no-scrollbar mb-8 flex gap-3 overflow-x-auto py-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer border whitespace-nowrap active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-brand-dark dark:bg-white border-brand-dark dark:border-white text-white dark:text-zinc-950 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 border-gray-150 dark:border-zinc-800 text-brand-dark dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Search Header Info */}
      {searchQuery && (
        <div className="mb-6 flex items-center gap-2 text-brand-gray dark:text-zinc-400 px-1">
          <Compass className="h-5 w-5" />
          <span className="font-sans text-sm">
            Search results for "<strong className="text-brand-dark dark:text-white">{searchQuery}</strong>"
          </span>
        </div>
      )}

      {error && (
        <div className="my-12 text-center text-red-500">
          <p className="font-semibold">{error}</p>
          <button 
            onClick={() => fetchPosts(1, true)}
            className="mt-4 rounded-full bg-brand-red px-6 py-2 text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Grid */}
      {posts.length > 0 ? (
        <>
          <div className="columns-2 gap-4 sm:columns-2 md:columns-3 lg:columns-3 xl:columns-4 [column-fill:_balance] box-border mx-auto">
            {posts.map((post, idx) => (
              <PostCard key={post._id || idx} post={post} />
            ))}
          </div>
          {/* Scroll anchor */}
          <div ref={bottomRef} className="h-10 w-full" />
        </>
      ) : (
        !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-900 text-brand-gray dark:text-zinc-400">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="mt-4 font-sans text-lg font-bold text-brand-dark dark:text-white">No ideas found</h3>
            <p className="mt-2 max-w-xs font-sans text-sm text-brand-gray dark:text-zinc-400">
              Try searching for something else or upload a new post to get started!
            </p>
          </div>
        )
      )}

      {/* Loading Skeletons */}
      {loading && <SkeletonLoader />}
      
    </div>
  );
};

export default Home;
