// ── Enums ──

export enum TerrainType {
  Earth = 'earth',
  Water = 'water',
  Stone = 'stone',
  Mist = 'mist',
  FertileVoid = 'fertile_void',
}

export enum TimeState {
  Normal = 'normal',
  Accelerated = 'accelerated',
  Slowed = 'slowed',
  Reversed = 'reversed',
  Frozen = 'frozen',
}

export enum Species {
  Liane = 'liane',
  Moss = 'moss',
  VoidFlower = 'void_flower',
  EchoShroom = 'echo_shroom',
}

export enum ActionType {
  Sow = 'sow',
  AlterTime = 'alter_time',
  Freeze = 'freeze',
  Harvest = 'harvest',
  Root = 'root',
  Spread = 'spread',
}

export enum FloraisonCategory {
  Cluster = 'cluster',
  Center = 'center',
  Contamination = 'contamination',
  Chain = 'chain',
  Symmetry = 'symmetry',
}

export enum FloraisonId {
  NodeDeRosee = 'node_de_rosee',
  CouronneRetournee = 'couronne_retournee',
  SiphonDesBrumes = 'siphon_des_brumes',
  SpiraleDormante = 'spirale_dormante',
  MiroirVerdoyant = 'miroir_verdoyant',
}

// ── Data structures ──

export interface Plant {
  id: string;
  ownerId: string;
  species: Species;
  age: number;
  rooted: boolean;
  /** Track whether this plant has ever regressed in age */
  hasRegressed: boolean;
}

export interface TemporalEffect {
  state: TimeState;
  turnsRemaining: number;
}

export interface Cell {
  x: number;
  y: number;
  terrain: TerrainType;
  timeState: TimeState;
  temporalEffect: TemporalEffect | null;
  plant: Plant | null;
}

export interface FloraisonSign {
  id: FloraisonId;
  category: FloraisonCategory;
  name: string;
  description: string;
}

export interface Player {
  id: string;
  name: string;
  sap: number;
  timeCharges: number;
  secretObjectives: FloraisonId[];
  harmonyPoints: number;
  completedObjectives: FloraisonId[];
}

// ── Actions ──

export interface SowAction {
  type: ActionType.Sow;
  x: number;
  y: number;
  species: Species;
}

export interface AlterTimeAction {
  type: ActionType.AlterTime;
  x: number;
  y: number;
  targetState: TimeState.Accelerated | TimeState.Slowed | TimeState.Reversed;
}

export interface FreezeAction {
  type: ActionType.Freeze;
  x: number;
  y: number;
}

export interface HarvestAction {
  type: ActionType.Harvest;
  x: number;
  y: number;
}

export interface RootAction {
  type: ActionType.Root;
  x: number;
  y: number;
}

export interface SpreadAction {
  type: ActionType.Spread;
  x: number;
  y: number;
}

export type GameAction =
  | SowAction
  | AlterTimeAction
  | FreezeAction
  | HarvestAction
  | RootAction
  | SpreadAction;

// ── Turn submission ──

export interface TurnSubmission {
  gameId: string;
  playerId: string;
  actions: [GameAction, GameAction];
}

// ── Game state ──

export interface GameState {
  gameId: string;
  board: Cell[][];
  players: [Player, Player];
  activePlayerId: string;
  turnNumber: number;
  maxTurns: number;
  phase: GamePhase;
  winner: string | null;
  winReason: 'floraison' | 'harmony' | null;
  actionLog: ActionLogEntry[];
  /** Track which cells had echo copies this turn (for Siphon des Brumes) */
  echoCopiedThisTurn: boolean;
}

export enum GamePhase {
  WaitingForPlayers = 'waiting',
  InProgress = 'in_progress',
  Finished = 'finished',
}

export interface ActionLogEntry {
  turnNumber: number;
  playerId: string;
  actions: GameAction[];
  growthEvents: string[];
  effectEvents: string[];
  timestamp: number;
}

// ── Client view (hides opponent's secret objectives) ──

export interface ClientGameState extends Omit<GameState, 'players'> {
  players: [ClientPlayer, ClientPlayer];
  isSolo?: boolean;
}

export interface ClientPlayer extends Omit<Player, 'secretObjectives'> {
  secretObjectives: FloraisonId[] | null;
  /** Categories visible to the opponent */
  objectiveCategories: FloraisonCategory[];
}

// ── Socket events ──

export interface ServerToClientEvents {
  room_created: (data: { roomCode: string; playerId: string }) => void;
  room_joined: (data: { roomCode: string; playerId: string }) => void;
  game_started: (data: { gameState: ClientGameState }) => void;
  game_updated: (data: { gameState: ClientGameState }) => void;
  game_over: (data: { gameState: ClientGameState }) => void;
  error: (data: { message: string }) => void;
  opponent_disconnected: () => void;
  opponent_reconnected: () => void;
}

export interface ClientToServerEvents {
  create_room: (data: { playerName: string }) => void;
  join_room: (data: { roomCode: string; playerName: string }) => void;
  submit_turn: (data: { actions: [GameAction, GameAction] }) => void;
  create_solo_game: (data: { playerName: string }) => void;
}
