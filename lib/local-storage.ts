import { v4 as uuidv4 } from 'uuid';

// Define storage keys
const STORAGE_KEYS = {
  IMAGES: 'novel_tavern_images',
  AUDIO: 'novel_tavern_audio',
};

// Define allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg'];

// Maximum file sizes (in bytes)
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB

interface StoredFile {
  id: string;
  name: string;
  type: string;
  data: string;
  size: number;
  createdAt: string;
}

interface StorageData {
  [key: string]: StoredFile;
}

// Initialize storage
const initializeStorage = (key: string): StorageData => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify({}));
    return {};
  }
  return JSON.parse(data);
};

// Get storage data
const getStorage = (key: string): StorageData => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : {};
};

// Save storage data
const saveStorage = (key: string, data: StorageData): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Upload a file
export const uploadFile = async (file: File, type: 'image' | 'audio'): Promise<string> => {
  // Validate file type
  const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_AUDIO_TYPES;
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Validate file size
  const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_AUDIO_SIZE;
  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`);
  }

  // Get storage key
  const storageKey = type === 'image' ? STORAGE_KEYS.IMAGES : STORAGE_KEYS.AUDIO;

  // Initialize storage if needed
  const storage = getStorage(storageKey);

  // Convert file to base64
  const base64Data = await fileToBase64(file);

  // Generate unique ID
  const fileId = uuidv4();

  // Create stored file object
  const storedFile: StoredFile = {
    id: fileId,
    name: file.name,
    type: file.type,
    data: base64Data,
    size: file.size,
    createdAt: new Date().toISOString(),
  };

  // Save file to storage
  storage[fileId] = storedFile;
  saveStorage(storageKey, storage);

  // Return file ID
  return fileId;
};

// Get file URL
export const getFileUrl = (fileId: string, type: 'image' | 'audio'): string | null => {
  const storageKey = type === 'image' ? STORAGE_KEYS.IMAGES : STORAGE_KEYS.AUDIO;
  const storage = getStorage(storageKey);
  const file = storage[fileId];
  return file ? file.data : null;
};

// Delete file
export const deleteFile = (fileId: string, type: 'image' | 'audio'): boolean => {
  const storageKey = type === 'image' ? STORAGE_KEYS.IMAGES : STORAGE_KEYS.AUDIO;
  const storage = getStorage(storageKey);
  
  if (storage[fileId]) {
    delete storage[fileId];
    saveStorage(storageKey, storage);
    return true;
  }
  
  return false;
};

// Clear storage
export const clearStorage = (type: 'image' | 'audio'): void => {
  const storageKey = type === 'image' ? STORAGE_KEYS.IMAGES : STORAGE_KEYS.AUDIO;
  localStorage.removeItem(storageKey);
  initializeStorage(storageKey);
};

// Get storage stats
export const getStorageStats = (type: 'image' | 'audio'): { count: number; totalSize: number } => {
  const storageKey = type === 'image' ? STORAGE_KEYS.IMAGES : STORAGE_KEYS.AUDIO;
  const storage = getStorage(storageKey);
  const files = Object.values(storage);
  
  return {
    count: files.length,
    totalSize: files.reduce((total, file) => total + file.size, 0),
  };
};

// Initialize storage on module load
initializeStorage(STORAGE_KEYS.IMAGES);
initializeStorage(STORAGE_KEYS.AUDIO);