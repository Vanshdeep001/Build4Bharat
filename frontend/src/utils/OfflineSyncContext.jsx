import { createContext, useContext, useState, useEffect } from 'react';
import api from './api';
import { savePendingSubmission as saveToIdb, getPendingSubmissions as getFromIdb, deletePendingSubmission as deleteFromIdb } from './offlineSync';

const OfflineSyncContext = createContext();

export function OfflineSyncProvider({ children }) {
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  // Load queue from IndexedDB
  useEffect(() => {
    const loadQueue = async () => {
      try {
        const saved = await getFromIdb();
        setOfflineQueue(saved || []);
      } catch (e) {
        console.error('IDB load error', e);
      }
    };
    loadQueue();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0 && !syncing) {
      syncData();
    }
  }, [isOnline, offlineQueue]);

  const addToQueue = async (submissionData) => {
    const item = {
      id: Date.now().toString(),
      data: submissionData,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    
    const newQueue = [...offlineQueue, item];
    setOfflineQueue(newQueue);
    await saveToIdb(item);
    return item;
  };

  const removeFromQueue = async (id) => {
    const newQueue = offlineQueue.filter(item => item.id !== id);
    setOfflineQueue(newQueue);
    await deleteFromIdb(id);
  };

  const markAsFailed = async (id) => {
    // Basic fallback logic
    const item = offlineQueue.find(i => i.id === id);
    if (!item) return;
    const updated = { ...item, status: 'failed' };
    const newQueue = offlineQueue.map(i => i.id === id ? updated : i);
    setOfflineQueue(newQueue);
    await saveToIdb(updated);
  };

  const syncData = async () => {
    if (syncing || offlineQueue.length === 0) return;
    
    setSyncing(true);
    
    // Create a copy to iterate
    const queueToProcess = [...offlineQueue];
    
    for (const item of queueToProcess) {
      try {
        // We stored the formData as base64/json, we need to reconstruct it 
        // For simplicity in this demo, if it has a photo it's complex to serialize FormData.
        // We will assume data is a JSON object with a base64 photo 'photoBase64'
        const formData = new FormData();
        Object.keys(item.data).forEach(key => {
          if (key === 'photoBase64' && item.data[key]) {
            // Convert base64 back to blob
            const base64Record = item.data[key];
            const byteString = atob(base64Record.split(',')[1]);
            const mimeString = base64Record.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], {type: mimeString});
            formData.append('photo', blob, 'offline_capture.jpg');
          } else if (key !== 'photoBase64') {
            formData.append(key, item.data[key]);
          }
        });

        await api.post('/submissions', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        // Success, remove from queue
        removeFromQueue(item.id);
        
      } catch (err) {
        console.error('Sync failed for item', item.id, err);
        markAsFailed(item.id);
      }
    }
    
    setSyncing(false);
  };

  return (
    <OfflineSyncContext.Provider value={{
      isOnline,
      offlineQueue,
      addToQueue,
      syncData,
      syncing
    }}>
      {children}
    </OfflineSyncContext.Provider>
  );
}

export const useOfflineSync = () => useContext(OfflineSyncContext);
