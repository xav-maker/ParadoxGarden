import { Server, Socket } from 'socket.io';
import {
  type ServerToClientEvents,
  type ClientToServerEvents,
  type GameAction,
  GamePhase,
} from '@jardins/shared';
import { roomManager, AI_PLAYER_ID } from '../rooms/RoomManager.js';
import { toClientState } from '../game/GameState.js';
import { resolveTurn } from '../game/turnResolver.js';
import { computeAIActions } from '../ai/aiPlayer.js';

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;

const AI_TURN_DELAY_MS = 800;

export function registerSocketHandlers(io: GameServer): void {
  io.on('connection', (socket: GameSocket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('create_room', ({ playerName }) => {
      const { room, playerId } = roomManager.createRoom(socket.id, playerName);
      socket.join(room.code);
      socket.emit('room_created', { roomCode: room.code, playerId });
      console.log(`Room ${room.code} created by ${playerName}`);
    });

    socket.on('create_solo_game', ({ playerName }) => {
      const { room, playerId } = roomManager.createSoloRoom(socket.id, playerName);
      socket.join(room.code);

      const clientState = toClientState(room.gameState!, playerId, true);
      socket.emit('room_joined', { roomCode: room.code, playerId });
      socket.emit('game_started', { gameState: clientState });

      console.log(`Solo game ${room.code} created by ${playerName}`);
    });

    socket.on('join_room', ({ roomCode, playerName }) => {
      const result = roomManager.joinRoom(roomCode, socket.id, playerName);

      if ('error' in result) {
        socket.emit('error', { message: result.error });
        return;
      }

      const { room, playerId } = result;
      socket.join(room.code);
      socket.emit('room_joined', { roomCode: room.code, playerId });

      if (room.gameState && room.player1 && room.player2) {
        const state1 = toClientState(room.gameState, room.player1.id);
        const state2 = toClientState(room.gameState, room.player2.id);

        if (room.player1.socketId) {
          io.to(room.player1.socketId).emit('game_started', { gameState: state1 });
        }
        if (room.player2.socketId) {
          io.to(room.player2.socketId).emit('game_started', { gameState: state2 });
        }
      }

      console.log(`${playerName} joined room ${roomCode}`);
    });

    socket.on('submit_turn', ({ actions }) => {
      const room = roomManager.getRoomBySocket(socket.id);
      if (!room?.gameState) {
        socket.emit('error', { message: 'No active game' });
        return;
      }

      const playerId = roomManager.getPlayerIdBySocket(socket.id);
      if (!playerId) {
        socket.emit('error', { message: 'Player not found' });
        return;
      }

      const result = resolveTurn(
        room.gameState,
        playerId,
        actions as [GameAction, GameAction],
      );

      if (!result.success) {
        socket.emit('error', { message: result.error ?? 'Invalid turn' });
        return;
      }

      // Send update to both players
      broadcastGameState(io, room);

      // If solo mode and game not over, check if it's AI's turn
      if (room.isSolo && room.gameState.phase === GamePhase.InProgress && room.gameState.activePlayerId === AI_PLAYER_ID) {
        scheduleAITurn(io, room);
      }
    });

    socket.on('rejoin_room', ({ roomCode, playerId }) => {
      const room = roomManager.handleReconnect(socket.id, roomCode, playerId);
      if (!room || !room.gameState) {
        socket.emit('error', { message: 'Could not rejoin room' });
        return;
      }

      socket.join(room.code);
      socket.emit('room_rejoined', {
        gameState: toClientState(room.gameState, playerId, room.isSolo || undefined),
      });

      const opponentSocketId = roomManager.getOpponentSocketId(socket.id);
      if (opponentSocketId) {
        io.to(opponentSocketId).emit('opponent_reconnected');
      }

      console.log(`Player ${playerId} rejoined room ${roomCode}`);
    });

    socket.on('disconnect', () => {
      const result = roomManager.handleDisconnect(socket.id);
      if (result) {
        io.to(result.opponentSocketId).emit('opponent_disconnected');
      }
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

function broadcastGameState(io: GameServer, room: ReturnType<typeof roomManager.getRoomBySocket> & {}) {
  if (!room?.gameState) return;

  const eventName = room.gameState.winner ? 'game_over' : 'game_updated';

  if (room.player1?.socketId) {
    io.to(room.player1.socketId).emit(eventName, {
      gameState: toClientState(room.gameState, room.player1.id, room.isSolo || undefined),
    });
  }
  if (room.player2?.socketId && room.player2.socketId !== '') {
    io.to(room.player2.socketId).emit(eventName, {
      gameState: toClientState(room.gameState, room.player2.id),
    });
  }
}

function scheduleAITurn(io: GameServer, room: NonNullable<ReturnType<typeof roomManager.getRoomBySocket>>) {
  setTimeout(() => {
    if (!room.gameState || room.gameState.phase !== GamePhase.InProgress) return;
    if (room.gameState.activePlayerId !== AI_PLAYER_ID) return;

    const aiActions = computeAIActions(room.gameState, AI_PLAYER_ID);
    const result = resolveTurn(room.gameState, AI_PLAYER_ID, aiActions);

    if (!result.success) {
      console.error(`AI turn failed: ${result.error}`);
      return;
    }

    broadcastGameState(io, room);
  }, AI_TURN_DELAY_MS);
}
