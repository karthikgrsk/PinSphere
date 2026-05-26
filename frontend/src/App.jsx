import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { InteractionProvider } from './context/InteractionContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Saved from './pages/Saved';
import UploadModal from './components/UploadModal';
import Toast from './components/Toast';
import CommentDrawer from './components/CommentDrawer';

// A wrapper to render Navbar only on protected pages
const AppLayout = ({ children, onSearch, onCreateClick }) => {
  return (
    <div className="min-h-screen bg-brand-softBg dark:bg-zinc-950 transition-colors duration-200">
      <Navbar onSearch={onSearch} onCreateClick={onCreateClick} />
      <main className="pb-16">{children}</main>
    </div>
  );
};

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handlePostCreated = () => {
    // Increment trigger to force Home reload
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <AuthProvider>
      <ThemeProvider>
        <InteractionProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout 
                      onSearch={handleSearch} 
                      onCreateClick={() => setIsUploadOpen(true)}
                    >
                      <Home 
                        key={refreshTrigger} // Reload Home on new post
                        searchQuery={searchQuery} 
                      />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/saved"
                element={
                  <ProtectedRoute>
                    <AppLayout 
                      onSearch={handleSearch} 
                      onCreateClick={() => setIsUploadOpen(true)}
                    >
                      <Saved />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Global Upload Modal */}
            <UploadModal
              isOpen={isUploadOpen}
              onClose={() => setIsUploadOpen(false)}
              onPostCreated={handlePostCreated}
            />

            {/* Global Overlays */}
            <Toast />
            <CommentDrawer />
          </Router>
        </InteractionProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
