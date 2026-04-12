import {
  Species,
  TerrainType,
  ActionType,
  FloraisonId,
  FloraisonCategory,
  type FloraisonSign,
} from './types.js';

// ── Board ──

export const BOARD_WIDTH = 7;
export const BOARD_HEIGHT = 7;
export const MAX_TURNS = 15;

// ── Resources ──

export const INITIAL_SAP = 3;
export const INITIAL_TIME_CHARGES = 2;
export const SAP_PER_TURN = 1;
export const TIME_CHARGE_INTERVAL = 2; // gain 1 charge every N turns
export const TIME_CHARGES_PER_GAIN = 1;

// ── Plant ages ──

export const MAX_AGE: Record<Species, number> = {
  [Species.Liane]: 4,
  [Species.Moss]: 4,
  [Species.VoidFlower]: 4,
  [Species.EchoShroom]: 4,
};

export const AGE_NAMES = ['Graine', 'Pousse', 'Mature', 'Spécialisée', 'Fin de cycle'] as const;

// ── Action costs ──

export interface ActionCost {
  sap: number;
  timeCharges: number;
}

export const ACTION_COSTS: Record<ActionType, ActionCost> = {
  [ActionType.Sow]: { sap: 1, timeCharges: 0 },
  [ActionType.AlterTime]: { sap: 0, timeCharges: 1 },
  [ActionType.Freeze]: { sap: 1, timeCharges: 0 },
  [ActionType.Harvest]: { sap: 0, timeCharges: 0 },
  [ActionType.Spread]: { sap: 0, timeCharges: 0 },
};

// ── Species / terrain compatibility ──

export const SPECIES_TERRAIN_COMPATIBILITY: Record<Species, TerrainType[]> = {
  [Species.Liane]: [TerrainType.Earth, TerrainType.Water, TerrainType.Stone, TerrainType.FertileVoid],
  [Species.Moss]: [TerrainType.Earth, TerrainType.Water, TerrainType.Stone, TerrainType.FertileVoid],
  [Species.VoidFlower]: [TerrainType.Earth, TerrainType.FertileVoid, TerrainType.Mist],
  [Species.EchoShroom]: [TerrainType.Earth, TerrainType.Mist, TerrainType.FertileVoid, TerrainType.Water],
};

// ── Floraisons-Signes ──

export const FLORAISON_DEFINITIONS: Record<FloraisonId, FloraisonSign> = {
  [FloraisonId.NodeDeRosee]: {
    id: FloraisonId.NodeDeRosee,
    category: FloraisonCategory.Cluster,
    name: 'Nœud de Rosée',
    description: '4 Mousses matures en carré 2×2, au moins 2 sur Eau, au moins 1 case Figée ce tour ou au tour précédent',
  },
  [FloraisonId.CouronneRetournee]: {
    id: FloraisonId.CouronneRetournee,
    category: FloraisonCategory.Center,
    name: 'Couronne Retournée',
    description: '1 Fleur-Vide âge 2 au centre de 4 plantes orthogonales, au moins 2 ayant subi une régression',
  },
  [FloraisonId.SiphonDesBrumes]: {
    id: FloraisonId.SiphonDesBrumes,
    category: FloraisonCategory.Contamination,
    name: 'Siphon des Brumes',
    description: '3 Champignons d\'Écho connectés, au moins 2 sur Brume, 1 effet copié ce tour',
  },
  [FloraisonId.SpiraleDormante]: {
    id: FloraisonId.SpiraleDormante,
    category: FloraisonCategory.Chain,
    name: 'Spirale Dormante',
    description: 'Chaîne de Lianes de longueur ≥5, extrémité figée, séquence d\'âges non croissante',
  },
  [FloraisonId.MiroirVerdoyant]: {
    id: FloraisonId.MiroirVerdoyant,
    category: FloraisonCategory.Symmetry,
    name: 'Miroir Verdoyant',
    description: 'Structure symétrique d\'espèces (pas d\'âges), avec au moins 2 cases Inversées',
  },
};

export const ALL_FLORAISON_IDS = Object.values(FloraisonId);

// ── Time state age deltas ──

export const TIME_STATE_AGE_DELTA: Record<string, number> = {
  normal: 1,
  accelerated: 2,
  slowed: 0,
  reversed: -1,
  frozen: 0,
};

// ── Board generation terrain distribution (approximate target counts on 7x7=49 cells) ──

export const TERRAIN_DISTRIBUTION: Record<TerrainType, number> = {
  [TerrainType.Earth]: 27,
  [TerrainType.Water]: 8,
  [TerrainType.Stone]: 6,
  [TerrainType.Mist]: 5,
  [TerrainType.FertileVoid]: 3,
};
