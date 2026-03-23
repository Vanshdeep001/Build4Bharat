import { io } from 'socket.io-client';

let socket = null;

export function connectSocket(districtId) {
  if (socket?.connected) return socket;

  socket = io(window.location.origin, {
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
