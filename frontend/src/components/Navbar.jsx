import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Search, Plus, LogOut, ChevronDown, User, Sparkles, Bookmark, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onSearch, onCreateClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchVal, setSearchVal] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchVal);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    if (onSearch && val === '') {
      onSearch(''); // Reset search if cleared
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 dark:border-zinc-800 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md transition-all duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-103">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-red text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.63 11.16-.1-.95-.19-2.42.04-3.46.21-.94 1.37-5.83 1.37-5.83s-.35-.7-.35-1.74c0-1.63.95-2.85 2.13-2.85 1.01 0 1.49.75 1.49 1.66 0 1.01-.64 2.53-.97 3.93-.28 1.18.59 2.14 1.75 2.14 2.1 0 3.72-2.22 3.72-5.42 0-2.83-2.04-4.81-4.94-4.81-3.37 0-5.35 2.53-5.35 5.14 0 1.02.39 2.11.88 2.71.1.12.11.23.08.35-.09.37-.29 1.18-.33 1.34-.05.21-.17.26-.39.16-1.46-.68-2.38-2.82-2.38-4.54 0-3.69 2.68-7.09 7.74-7.09 4.06 0 7.22 2.89 7.22 6.76 0 4.04-2.54 7.29-6.07 7.29-1.19 0-2.3-.62-2.68-1.34l-.73 2.78c-.26 1.01-.98 2.28-1.46 3.06C9.37 23.8 10.66 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z" />
              </svg>
            </div>
            <span className="hidden font-sans text-xl font-extrabold tracking-tight text-brand-dark dark:text-white sm:block">
              Pin<span className="text-brand-red">Sphere</span>
            </span>
          </Link>
          
          {/* Navigation links */}
          {user && (
            <div className="ml-4 hidden items-center gap-1 sm:flex">
              <Link 
                to="/" 
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                  isHome 
                    ? 'bg-brand-dark dark:bg-white text-white dark:text-zinc-950 shadow-sm' 
                    : 'text-brand-dark dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/saved" 
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                  location.pathname === '/saved' 
                    ? 'bg-brand-dark dark:bg-white text-white dark:text-zinc-950 shadow-sm' 
                    : 'text-brand-dark dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                Saved
              </Link>
              <button 
                onClick={onCreateClick}
                className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-brand-dark dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Create
              </button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        {user && (
          <form 
            onSubmit={handleSearchSubmit} 
            className="mx-4 flex flex-1 max-w-2xl items-center"
          >
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-brand-gray dark:text-zinc-400" />
              </div>
              <input
                type="text"
                value={searchVal}
                onChange={handleSearchChange}
                placeholder="Search ideas, categories, creators..."
                className="block w-full rounded-pinterest-large border border-transparent bg-brand-lightGray/70 dark:bg-zinc-800/80 py-2.5 pl-10 pr-4 font-sans text-sm text-brand-dark dark:text-gray-100 placeholder-brand-gray dark:placeholder-zinc-400 outline-none transition-all focus:border-transparent focus:bg-brand-lightGray dark:focus:bg-zinc-800 focus:ring-2 focus:ring-gray-300 dark:focus:ring-zinc-700"
              />
            </div>
          </form>
        )}

        {/* User Actions */}
        <div className="flex items-center gap-3">
          
          {/* Modern Theme Toggle Pill Switch */}
          <button
            onClick={toggleTheme}
            className={`relative flex h-7 w-12 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${
              theme === 'light' ? 'bg-amber-100/50 justify-start' : 'bg-indigo-950/40 border border-zinc-800/80 justify-end'
            }`}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {/* Background Symbols */}
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none select-none text-zinc-400 dark:text-zinc-600">
              <Moon className="h-3.5 w-3.5" />
            </div>
            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none select-none text-amber-500/60">
              <Sun className="h-3.5 w-3.5" />
            </div>

            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-zinc-900 shadow-md"
            >
              {theme === 'light' ? (
                <Sun className="h-3.5 w-3.5 text-amber-500 fill-amber-100" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-indigo-400 fill-indigo-950" />
              )}
            </motion.div>
          </button>

          {user ? (
            <>
              {/* Mobile Create shortcut */}
              <button 
                onClick={onCreateClick}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-red text-white sm:hidden hover:bg-red-700 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="h-5 w-5" />
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 rounded-full border border-gray-100 dark:border-zinc-800 p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors active:scale-98"
                >
                  <img
                    src={user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=default'}
                    alt={user.username}
                    className="h-8 w-8 rounded-full border-2 border-brand-red bg-gray-50 object-cover"
                  />
                  <ChevronDown className="hidden h-4 w-4 text-brand-gray dark:text-zinc-400 sm:block" />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      {/* Backdrop to close */}
                      <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                      ></div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-2xl bg-white dark:bg-zinc-900 p-2 shadow-xl border border-gray-100 dark:border-zinc-800 ring-1 ring-black/5 dark:ring-white/5"
                      >
                        <div className="border-b border-gray-100 dark:border-zinc-800 px-4 py-3">
                          <p className="font-sans text-xs text-brand-gray dark:text-zinc-400">Signed in as</p>
                          <p className="truncate font-sans text-sm font-bold text-brand-dark dark:text-white">{user.username}</p>
                          <p className="truncate font-sans text-xs text-brand-gray dark:text-zinc-400">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/saved"
                            onClick={() => setDropdownOpen(false)}
                            className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left font-sans text-sm font-semibold text-brand-dark dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          >
                            <Bookmark className="h-4 w-4 text-brand-gray dark:text-zinc-400" />
                            Saved Pins
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left font-sans text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                          >
                            <LogOut className="h-4 w-4" />
                            Log out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Link 
                to="/login"
                className="rounded-full bg-brand-lightGray dark:bg-zinc-800 px-4 py-2 text-sm font-bold text-brand-dark dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Log in
              </Link>
              <Link 
                to="/register"
                className="rounded-full bg-brand-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition-colors shadow-sm"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
