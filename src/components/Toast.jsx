import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="toast-container">
      <div className={`toast ${isSuccess ? 'toast-success' : isError ? 'toast-error' : ''}`}>
        {isSuccess && <CheckCircle2 size={18} />}
        {isError && <AlertCircle size={18} />}
        {!isSuccess && !isError && <Info size={18} />}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}

