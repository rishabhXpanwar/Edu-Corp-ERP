import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL, ACCESS_TOKEN_KEY } from '../constants/appConfig.js';

const useSocket = ({ onNotificationNew } = {}) => {
  const socketRef = useRef(null);
  const intentionalDisconnectRef = useRef(false);

  useEffect(() => {
    intentionalDisconnectRef.current = false;

    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      return undefined;
    }

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 5,
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('[Socket] connected — id:', socketRef.current.id);
    });

    socketRef.current.on('connect_error', (err) => {
      if (intentionalDisconnectRef.current) {
        return;
      }
      console.log('[Socket] connection error:', err.message);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('[Socket] disconnected — reason:', reason);
      if (reason === 'io server disconnect') {
        // Server forced disconnect — treat as session expiry
        // dispatch(clearAuth()) — will be wired when COMP-01 builds clearAuth
        localStorage.clear();
        window.location.href = '/login';
      }
      // Other reasons: socket auto-reconnects
    });

    if (typeof onNotificationNew === 'function') {
      socketRef.current.on('notification:new', onNotificationNew);
    }

    return () => {
      if (socketRef.current) {
        intentionalDisconnectRef.current = true;

        if (typeof onNotificationNew === 'function') {
          socketRef.current.off('notification:new', onNotificationNew);
        }

        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [onNotificationNew]);

  return socketRef;
};

export default useSocket;
