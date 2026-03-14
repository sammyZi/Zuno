/**
 * Toast Manager
 * Global toast notification manager
 */

import React, { useState, useEffect } from 'react';
import { Toast, ToastType } from './Toast';
import { useDownloadStore } from '../../store';

interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  progress?: number;
  visible: boolean;
}

export const ToastManager: React.FC = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const { downloadProgress } = useDownloadStore();

  // Monitor download progress
  useEffect(() => {
    const activeDownloads = Array.from(downloadProgress.entries());
    
    // Update or create toasts for active downloads
    activeDownloads.forEach(([songId, progress]) => {
      const existingToast = toasts.find(t => t.id === songId);
      
      if (existingToast) {
        // Update existing toast
        setToasts(prev =>
          prev.map(t =>
            t.id === songId
              ? { ...t, progress: progress.progress, visible: true }
              : t
          )
        );
      } else {
        // Create new toast
        const newToast: ToastData = {
          id: songId,
          message: 'Downloading song...',
          type: 'download',
          progress: progress.progress,
          visible: true,
        };
        setToasts(prev => [...prev, newToast]);
      }
    });

    // Remove toasts for completed downloads
    setToasts(prev =>
      prev.filter(t => {
        const isActive = downloadProgress.has(t.id);
        if (!isActive && t.progress === 100) {
          // Show completion message briefly
          setTimeout(() => {
            setToasts(current => current.filter(ct => ct.id !== t.id));
          }, 2000);
          return true;
        }
        return isActive;
      })
    );
  }, [downloadProgress]);

  const handleCloseToast = (id: string) => {
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, visible: false } : t)));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  };

  return (
    <>
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          visible={toast.visible}
          message={
            toast.progress === 100
              ? 'Download complete!'
              : toast.message
          }
          type={toast.progress === 100 ? 'success' : toast.type}
          progress={toast.progress}
          onClose={() => handleCloseToast(toast.id)}
          duration={toast.progress === 100 ? 2000 : 0}
        />
      ))}
    </>
  );
};
