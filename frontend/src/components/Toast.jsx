import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useInteraction } from '../context/InteractionContext';

const Toast = () => {
  const { toast, dismissToast } = useInteraction();

  return (
    <AnimatePresence>
      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.15 } }}
            className={`flex items-center gap-3 rounded-2xl p-4 shadow-premium border backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-red-50 border-red-100 text-red-800 dark:bg-red-950/90 dark:border-red-900/50 dark:text-red-200'
                : toast.type === 'success'
                ? 'bg-green-50 border-green-100 text-green-800 dark:bg-green-950/90 dark:border-green-900/50 dark:text-green-200'
                : 'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-950/90 dark:border-blue-900/50 dark:text-blue-200'
            }`}
          >
            {toast.type === 'error' && <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />}
            {toast.type === 'success' && <CheckCircle className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />}
            {toast.type !== 'error' && toast.type !== 'success' && <Info className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />}
            
            <p className="font-sans text-sm font-semibold pr-2">{toast.message}</p>

            <button
              onClick={dismissToast}
              className="ml-auto rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
