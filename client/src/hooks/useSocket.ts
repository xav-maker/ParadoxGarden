import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  ClientGameState,
  GameAction,
} from '@jardins/shared';

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SERVER_URL = import.meta.env.VITE_SERVER_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');

const SESSION_KEY = 'jardins_session';

interface StoredSession {
  roomCode: string;
  playerId: string;
}

function saveSession(roomCode: string, playerId: string) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ roomCode, playerId }));
  } catch { /* localStorage unavailable */ }
}

function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.roomCode && parsed?.playerId) return parsed as StoredSession;
  } catch { /* corrupted or unavailable */ }
  return null;
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch { /* localStorage unavailable */ }
}

export interface UseSocketReturn {
  connected: boolean;
  roomCode: string | null;
  playerId: string | null;
  gameState: ClientGameState | null;
  errorMessage: string | null;
  opponentDisconnected: boolean;
  reconnecting: boolean;
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  createSoloGame: (playerName: string) => void;
  submitTurn: (actions: [GameAction, GameAction]) => void;
  leaveGame: () => void;
  clearError: () => void;
}

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<GameSocket | null>(null);
  const roomCodeRef = useRef<string | null>(null);
  const playerIdRef = useRef<string | null>(null);
  const reconnectingRef = useRef(false);
  const [connected, setConnected] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<ClientGameState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    const stored = loadSession();
    if (stored) {
      roomCodeRef.current = stored.roomCode;
      playerIdRef.current = stored.playerId;
      reconnectingRef.current = true;
      setReconnecting(true);
    }

    const socket: GameSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      if (roomCodeRef.current && playerIdRef.current) {
        socket.emit('rejoin_room', {
          roomCode: roomCodeRef.current,
          playerId: playerIdRef.current,
        });
      }
    });
    socket.on('disconnect', () => setConnected(false));

    socket.on('room_created', ({ roomCode, playerId }) => {
      roomCodeRef.current = roomCode;
      playerIdRef.current = playerId;
      saveSession(roomCode, playerId);
      setRoomCode(roomCode);
      setPlayerId(playerId);
    });

    socket.on('room_joined', ({ roomCode, playerId }) => {
      roomCodeRef.current = roomCode;
      playerIdRef.current = playerId;
      reconnectingRef.current = false;
      saveSession(roomCode, playerId);
      setRoomCode(roomCode);
      setPlayerId(playerId);
      setReconnecting(false);
    });

    socket.on('room_rejoined', ({ gameState }) => {
      reconnectingRef.current = false;
      setRoomCode(roomCodeRef.current);
      setPlayerId(playerIdRef.current);
      setGameState(gameState);
      setOpponentDisconnected(false);
      setReconnecting(false);
    });

    socket.on('room_rejoined_lobby', ({ roomCode, playerId }) => {
      roomCodeRef.current = roomCode;
      playerIdRef.current = playerId;
      reconnectingRef.current = false;
      setRoomCode(roomCode);
      setPlayerId(playerId);
      setReconnecting(false);
    });

    socket.on('game_started', ({ gameState }) => {
      setGameState(gameState);
    });

    socket.on('game_updated', ({ gameState }) => {
      setGameState(gameState);
      setOpponentDisconnected(false);
    });

    socket.on('game_over', ({ gameState }) => {
      setGameState(gameState);
      clearSession();
    });

    socket.on('error', ({ message }) => {
      setErrorMessage(message);
      if (reconnectingRef.current) {
        clearSession();
        roomCodeRef.current = null;
        playerIdRef.current = null;
        reconnectingRef.current = false;
        setRoomCode(null);
        setPlayerId(null);
        setReconnecting(false);
      }
    });

    socket.on('opponent_disconnected', () => {
      setOpponentDisconnected(true);
    });

    socket.on('opponent_reconnected', () => {
      setOpponentDisconnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = useCallback((playerName: string) => {
    socketRef.current?.emit('create_room', { playerName });
  }, []);

  const joinRoom = useCallback((roomCode: string, playerName: string) => {
    socketRef.current?.emit('join_room', { roomCode, playerName });
  }, []);

  const createSoloGame = useCallback((playerName: string) => {
    socketRef.current?.emit('create_solo_game', { playerName });
  }, []);

  const submitTurn = useCallback((actions: [GameAction, GameAction]) => {
    socketRef.current?.emit('submit_turn', { actions });
  }, []);

  const leaveGame = useCallback(() => {
    clearSession();
    roomCodeRef.current = null;
    playerIdRef.current = null;
    reconnectingRef.current = false;
    setRoomCode(null);
    setPlayerId(null);
    setGameState(null);
    setOpponentDisconnected(false);
    setReconnecting(false);
  }, []);

  const clearError = useCallback(() => setErrorMessage(null), []);

  return {
    connected,
    roomCode,
    playerId,
    gameState,
    errorMessage,
    opponentDisconnected,
    reconnecting,
    createRoom,
    joinRoom,
    createSoloGame,
    submitTurn,
    leaveGame,
    clearError,
  };
}
