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
  const previousProgressRef = React.useRef<Map<string, number>>(new Map());

  // Monitor download progress
  useEffect(() => {
    const activeDownloads = Array.from(downloadProgress.entries());
    const currentIds = new Set(activeDownloads.map(([id]) => id));
    
    // Update or create toasts for active downloads
    const updatedToasts = [...toasts];
    let hasChanges = false;

    activeDownloads.forEach(([songId, progress]) => {
      const existingIndex = updatedToasts.findIndex(t => t.id === songId);
      const previousProgress = previousProgressRef.current.get(songId) || 0;
      
      // Only update if progress actually changed (prevent glitches)
      if (Math.abs(progress.progress - previousProgress) < 0.5 && existingIndex !== -1) {
        return; // Skip minor updates
      }

      previousProgressRef.current.set(songId, progress.progress);
      
      if (existingIndex !== -1) {
        // Update existing toast
        updatedToasts[existingIndex] = {
          ...updatedToasts[existingIndex],
          progress: progress.progress,
          visible: true,
          message: progress.progress === 100 ? 'Download complete!' : `Downloading ${progress.songName || 'song'}...`,
          type: progress.progress === 100 ? 'success' : 'download',
        };
        hasChanges = true;
      } else {
        // Create new toast
        updatedToasts.push({
          id: songId,
          message: `Downloading ${progress.songName || 'song'}...`,
          type: 'download',
          progress: progress.progress,
          visible: true,
        });
        hasChanges = true;
      }
    });

    // Mark completed downloads for removal
    updatedToasts.forEach((toast, index) => {
      if (!currentIds.has(toast.id) && toast.progress === 100) {
        // Auto-remove completed toasts after 2 seconds
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id));
          previousProgressRef.current.delete(toast.id);
        }, 2000);
      } else if (!currentIds.has(toast.id) && toast.progress !== 100) {
        // Remove cancelled/failed downloads immediately
        updatedToasts.splice(index, 1);
        previousProgressRef.current.delete(toast.id);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setToasts(updatedToasts);
    }
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
          message={toast.message}
          type={toast.type}
          progress={toast.progress}
          onClose={() => handleCloseToast(toast.id)}
          duration={toast.type === 'success' ? 2000 : 0}
          index={index}
          totalCount={toasts.length}
        />
      ))}
    </>
  );
};
