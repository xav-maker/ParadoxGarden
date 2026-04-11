import { v4 as uuid } from 'uuid';
import { type GameState, GamePhase } from '@jardins/shared';
import { createGameState } from '../game/GameState.js';

export const AI_PLAYER_ID = 'ai-player';
export const AI_PLAYER_NAME = 'Ordinateur';

export interface Room {
  code: string;
  gameId: string;
  player1: { id: string; name: string; socketId: string } | null;
  player2: { id: string; name: string; socketId: string } | null;
  gameState: GameState | null;
  isSolo: boolean;
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

class RoomManager {
  private rooms = new Map<string, Room>();
  private socketToRoom = new Map<string, string>();

  createRoom(socketId: string, playerName: string): { room: Room; playerId: string } {
    const code = generateRoomCode();
    const playerId = uuid();
    const gameId = uuid();

    const room: Room = {
      code,
      gameId,
      player1: { id: playerId, name: playerName, socketId },
      player2: null,
      gameState: null,
      isSolo: false,
    };

    this.rooms.set(code, room);
    this.socketToRoom.set(socketId, code);

    return { room, playerId };
  }

  createSoloRoom(socketId: string, playerName: string): { room: Room; playerId: string } {
    const code = generateRoomCode();
    const playerId = uuid();
    const gameId = uuid();

    const room: Room = {
      code,
      gameId,
      player1: { id: playerId, name: playerName, socketId },
      player2: { id: AI_PLAYER_ID, name: AI_PLAYER_NAME, socketId: '' },
      gameState: null,
      isSolo: true,
    };

    room.gameState = createGameState(
      gameId,
      playerId,
      playerName,
      AI_PLAYER_ID,
      AI_PLAYER_NAME,
    );

    this.rooms.set(code, room);
    this.socketToRoom.set(socketId, code);

    return { room, playerId };
  }

  joinRoom(
    roomCode: string,
    socketId: string,
    playerName: string,
  ): { room: Room; playerId: string } | { error: string } {
    const room = this.rooms.get(roomCode);
    if (!room) return { error: 'Room not found' };
    if (room.player2) return { error: 'Room is full' };

    const playerId = uuid();
    room.player2 = { id: playerId, name: playerName, socketId };
    this.socketToRoom.set(socketId, roomCode);

    room.gameState = createGameState(
      room.gameId,
      room.player1!.id,
      room.player1!.name,
      room.player2.id,
      room.player2.name,
    );

    return { room, playerId };
  }

  getRoomBySocket(socketId: string): Room | null {
    const code = this.socketToRoom.get(socketId);
    if (!code) return null;
    return this.rooms.get(code) ?? null;
  }

  getPlayerIdBySocket(socketId: string): string | null {
    const room = this.getRoomBySocket(socketId);
    if (!room) return null;
    if (room.player1?.socketId === socketId) return room.player1.id;
    if (room.player2?.socketId === socketId) return room.player2.id;
    return null;
  }

  getOpponentSocketId(socketId: string): string | null {
    const room = this.getRoomBySocket(socketId);
    if (!room) return null;
    if (room.player1?.socketId === socketId) {
      const opSock = room.player2?.socketId;
      return opSock && opSock !== '' ? opSock : null;
    }
    if (room.player2?.socketId === socketId) {
      const opSock = room.player1?.socketId;
      return opSock && opSock !== '' ? opSock : null;
    }
    return null;
  }

  handleDisconnect(socketId: string): { room: Room; opponentSocketId: string } | null {
    const room = this.getRoomBySocket(socketId);
    if (!room) return null;

    const opponentSocketId = this.getOpponentSocketId(socketId);
    this.socketToRoom.delete(socketId);

    if (room.player1?.socketId === socketId) room.player1.socketId = '';
    if (room.player2?.socketId === socketId) room.player2.socketId = '';

    if (opponentSocketId) {
      return { room, opponentSocketId };
    }

    // Both disconnected, clean up
    if (!room.player1?.socketId && !room.player2?.socketId) {
      this.rooms.delete(room.code);
    }

    return null;
  }

  handleReconnect(socketId: string, roomCode: string, playerId: string): Room | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    if (room.player1?.id === playerId) {
      room.player1.socketId = socketId;
    } else if (room.player2?.id === playerId) {
      room.player2.socketId = socketId;
    } else {
      return null;
    }

    this.socketToRoom.set(socketId, roomCode);
    return room;
  }
}

export const roomManager = new RoomManager();
