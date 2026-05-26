import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-softBg dark:bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md space-y-8 rounded-pinterest-large bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800/80 p-8 shadow-premium"
      >
        <div className="flex flex-col items-center justify-center">
          {/* Custom PinSphere Red Logo Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-red text-white shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.63 11.16-.1-.95-.19-2.42.04-3.46.21-.94 1.37-5.83 1.37-5.83s-.35-.7-.35-1.74c0-1.63.95-2.85 2.13-2.85 1.01 0 1.49.75 1.49 1.66 0 1.01-.64 2.53-.97 3.93-.28 1.18.59 2.14 1.75 2.14 2.1 0 3.72-2.22 3.72-5.42 0-2.83-2.04-4.81-4.94-4.81-3.37 0-5.35 2.53-5.35 5.14 0 1.02.39 2.11.88 2.71.1.12.11.23.08.35-.09.37-.29 1.18-.33 1.34-.05.21-.17.26-.39.16-1.46-.68-2.38-2.82-2.38-4.54 0-3.69 2.68-7.09 7.74-7.09 4.06 0 7.22 2.89 7.22 6.76 0 4.04-2.54 7.29-6.07 7.29-1.19 0-2.3-.62-2.68-1.34l-.73 2.78c-.26 1.01-.98 2.28-1.46 3.06C9.37 23.8 10.66 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-brand-dark dark:text-white">
            Welcome to PinSphere
          </h2>
          <p className="mt-2 text-center text-sm text-brand-gray dark:text-zinc-400">
            Find and share new ideas
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-600 dark:text-red-400"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="email-address" className="text-xs font-semibold text-brand-dark dark:text-zinc-300 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-brand-gray dark:text-zinc-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-pinterest border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 py-3 pl-10 pr-3 font-sans text-brand-dark dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:border-brand-red focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-brand-red sm:text-sm transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-semibold text-brand-dark dark:text-zinc-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-brand-gray dark:text-zinc-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-pinterest border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 py-3 pl-10 pr-3 font-sans text-brand-dark dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:border-brand-red focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-brand-red sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-pinterest bg-brand-red py-3 px-4 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 disabled:opacity-50 transition-all cursor-pointer shadow-md active:scale-95"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <span className="flex items-center gap-1">
                  Log in <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-brand-gray dark:text-zinc-400">
          Not on PinSphere yet?{' '}
          <Link to="/register" className="font-semibold text-brand-red hover:underline">
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
