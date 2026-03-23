import { openDB } from 'idb';

const DB_NAME = 'pmddky-offline-db';
const STORE_NAME = 'pending-submissions';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const savePendingSubmission = async (submissionData) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const dataToSave = {
    ...submissionData,
    timestamp: Date.now(),
  };
  await store.put(dataToSave);
  await tx.done;
  console.log('Submission saved locally for offline sync');
};

export const getPendingSubmissions = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const deletePendingSubmission = async (id) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.delete(id);
  await tx.done;
};

export const clearPendingSubmissions = async () => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.clear();
  await tx.done;
};
