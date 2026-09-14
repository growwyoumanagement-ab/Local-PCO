import { io, Socket } from 'socket.io-client';
import { secureStorage } from './secureStorage';
import CONFIG from '../config';

const SOCKET_URL = (__DEV__ ? CONFIG.API_URLS.DEV : CONFIG.API_URLS.PROD).replace('/api/v1', '');
const SOCKET_FALLBACK_URL = (__DEV__ ? CONFIG.API_URLS.DEV : CONFIG.API_URLS.FALLBACK).replace('/api/v1', ''); // Backup Render service
const STORAGE_KEYS = {
    ACCESS_TOKEN: '@LocalPCO:accessToken',
};

class SocketService {
    private socket: Socket | null = null;
    private connectionPromise: Promise<Socket> | null = null;
    private usingFallback = false;

    public async connect(): Promise<Socket> {
        // Return existing connected socket immediately
        if (this.socket?.connected) {
            return this.socket;
        }

        // Coalesce concurrent connection calls into a single Promise
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        const token = await secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!token) {
            console.log('[Socket] Cannot connect, token missing');
            throw new Error('Token missing');
        }

        this.connectionPromise = new Promise<Socket>((resolve, reject) => {
            const targetUrl = this.usingFallback ? SOCKET_FALLBACK_URL : SOCKET_URL;
            console.log('[Socket] Connecting to server:', targetUrl);
            const socket = io(targetUrl, {
                auth: { token },
                transports: ['websocket'],
                autoConnect: false,
                // FIX #2: Enable automatic reconnection so the socket re-registers
                // its listeners after a network blip or server restart.
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 2000,
                reconnectionDelayMax: 10000,
            });

            this.socket = socket;

            const onConnect = () => {
                console.log('[Socket] Connected, ID:', socket.id);
                this.connectionPromise = null;
                resolve(socket);
            };

            const onConnectError = (error: any) => {
                console.error('[Socket] Connection error:', error.message);
                this.connectionPromise = null;
                this.socket = null;

                // ── Fallback: try the backup Render service once ──
                if (!this.usingFallback) {
                    this.usingFallback = true;
                    console.warn('[Socket] Switching to fallback socket URL:', SOCKET_FALLBACK_URL);
                    // Retry connection with fallback URL
                    this.connect()
                        .then(resolve)
                        .catch(reject);
                } else {
                    reject(error);
                }
            };

            socket.once('connect', onConnect);
            socket.once('connect_error', onConnectError);

            socket.on('disconnect', (reason) => {
                console.log('[Socket] Disconnected:', reason);
                // Do NOT null out socket/promise here — reconnection logic needs the instance
                // Only clean up if explicitly disconnected (i.e., went offline)
            });

            // FIX #2: Log reconnection attempts for debugging
            socket.on('reconnect_attempt', (attempt) => {
                console.log(`[Socket] Reconnection attempt #${attempt}`);
            });

            socket.on('reconnect', (attempt) => {
                console.log(`[Socket] Reconnected after ${attempt} attempts`);
            });

            socket.on('reconnect_failed', () => {
                console.error('[Socket] All reconnection attempts failed');
                this.socket = null;
                this.connectionPromise = null;
            });

            socket.connect();
        });

        return this.connectionPromise;
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connectionPromise = null;
            console.log('[Socket] Disconnected and cleaned up instance');
        }
    }

    public getSocket(): Socket | null {
        return this.socket;
    }
}

export const socketService = new SocketService();
