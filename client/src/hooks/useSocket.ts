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

export interface UseSocketReturn {
  connected: boolean;
  roomCode: string | null;
  playerId: string | null;
  gameState: ClientGameState | null;
  errorMessage: string | null;
  opponentDisconnected: boolean;
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  createSoloGame: (playerName: string) => void;
  submitTurn: (actions: [GameAction, GameAction]) => void;
  clearError: () => void;
}

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<GameSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<ClientGameState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);

  useEffect(() => {
    const socket: GameSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('room_created', ({ roomCode, playerId }) => {
      setRoomCode(roomCode);
      setPlayerId(playerId);
    });

    socket.on('room_joined', ({ roomCode, playerId }) => {
      setRoomCode(roomCode);
      setPlayerId(playerId);
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
    });

    socket.on('error', ({ message }) => {
      setErrorMessage(message);
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

  const clearError = useCallback(() => setErrorMessage(null), []);

  return {
    connected,
    roomCode,
    playerId,
    gameState,
    errorMessage,
    opponentDisconnected,
    createRoom,
    joinRoom,
    createSoloGame,
    submitTurn,
    clearError,
  };
}
