import { io } from 'socket.io-client';

// Derive the backend base URL from the API env var (strip /api suffix)
const BACKEND_URL = import.meta.env.VITE_PUBLIC_API_URL
  ? import.meta.env.VITE_PUBLIC_API_URL.replace(/\/api\/?$/, '')
  : window.location.origin;

let socket = null;

export function connectSocket(districtId) {
  if (socket?.connected) return socket;

  socket = io(BACKEND_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected');
    if (districtId) {
      socket.emit('join_district', { district_id: districtId });
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected');
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
