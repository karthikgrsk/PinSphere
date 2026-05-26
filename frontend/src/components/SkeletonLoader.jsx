import React from 'react';

const SkeletonLoader = () => {
  // Generate different aspect ratio heights for a masonry feel
  const heights = ['h-64', 'h-80', 'h-96', 'h-72', 'h-80', 'h-64'];

  return (
    <div className="masonry-grid w-full px-4 sm:px-6 md:px-8 py-6">
      {heights.map((height, i) => (
        <div 
          key={i} 
          className={`break-inside-avoid mb-4 overflow-hidden rounded-pinterest bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800/60 p-2 shadow-premium`}
        >
          <div className={`w-full ${height} animate-pulse rounded-xl bg-gray-200 dark:bg-zinc-800`}></div>
          <div className="mt-3 space-y-2 p-1">
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-zinc-800"></div>
            <div className="flex items-center gap-2 pt-2">
              <div className="h-6 w-6 animate-pulse rounded-full bg-gray-200 dark:bg-zinc-800"></div>
              <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-zinc-800"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
