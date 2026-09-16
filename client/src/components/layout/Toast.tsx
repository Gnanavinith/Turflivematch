import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ToastState } from '../../hooks/useToast';

interface ToastProps {
  toast: ToastState | null;
}

export default function Toast({ toast }: ToastProps) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className={`fixed top-4 left-1/2 z-50 flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold shadow-xl border ${
            toast.type === 'warn'
              ? 'bg-red-50 border-red-200 text-red-800'
              : toast.type === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <CheckCircle2 size={16} className={toast.type === 'warn' ? 'text-red-500' : toast.type === 'info' ? 'text-blue-500' : 'text-emerald-500'} />
          <span>{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}