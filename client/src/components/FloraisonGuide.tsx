import { useState } from 'react';
import type { FloraisonId, ClientPlayer } from '@jardins/shared';
import { FLORAISON_DEFINITIONS } from '@jardins/shared';

interface FloraisonGuideProps {
  player: ClientPlayer;
}

interface ConditionItem {
  label: string;
  detail: string;
}

const FLORAISON_CONDITIONS: Record<FloraisonId, ConditionItem[]> = {
  node_de_rosee: [
    { label: 'Forme', detail: '4 Mousses en carre 2x2' },
    { label: 'Age requis', detail: 'Toutes matures (age >= 2)' },
    { label: 'Terrain', detail: 'Au moins 2 cases sur Eau' },
    { label: 'Temps', detail: 'Au moins 1 case de la structure Figee ce tour ou au tour precedent' },
  ],
  couronne_retournee: [
    { label: 'Centre', detail: '1 Fleur-Vide a l\'age exact 2' },
    { label: 'Forme', detail: '4 plantes alliees sur les 4 cases orthogonales autour du centre' },
    { label: 'Condition', detail: 'Au moins 2 de ces 4 plantes ont subi une regression d\'age durant la partie' },
  ],
  siphon_des_brumes: [
    { label: 'Forme', detail: '3 Champignons d\'Echo connectes (adjacence orthogonale)' },
    { label: 'Terrain', detail: 'Au moins 2 des 3 sur cases Brume' },
    { label: 'Effet', detail: '1 effet copie (par un Champignon) doit avoir eu lieu ce tour' },
  ],
  spirale_dormante: [
    { label: 'Forme', detail: 'Chaine de Lianes de longueur >= 5 (connexion orthogonale)' },
    { label: 'Extremite', detail: 'L\'une des extremites de la chaine doit etre sur une case Figee' },
    { label: 'Sequence', detail: 'Les ages le long de la chaine doivent etre non croissants (chaque age <= le precedent)' },
  ],
  miroir_verdoyant: [
    { label: 'Forme', detail: 'Structure symetrique de plantes alliees (axe horizontal ou vertical du plateau)' },
    { label: 'Symetrie', detail: 'Les especes doivent etre identiques en miroir, mais PAS les ages' },
    { label: 'Temps', detail: 'Au moins 2 cases de la structure avec l\'etat temporel Inverse' },
    { label: 'Minimum', detail: 'Au moins 4 plantes dans la structure (2 paires symetriques)' },
  ],
};

const CATEGORY_COLORS: Record<string, string> = {
  cluster: '#3ecfa5',
  center: '#d4a843',
  contamination: '#7e8bc4',
  chain: '#4caf6a',
  symmetry: '#c47ef0',
};

export function FloraisonGuide({ player }: FloraisonGuideProps) {
  const [expandedId, setExpandedId] = useState<FloraisonId | null>(null);

  if (!player.secretObjectives) return null;

  return (
    <div className="floraison-guide">
      <h3>Floraisons-Signes</h3>
      <p className="floraison-guide-hint">
        Realisez l'une de ces configurations pour gagner.
      </p>

      {player.secretObjectives.map((objId) => {
        const def = FLORAISON_DEFINITIONS[objId];
        const conditions = FLORAISON_CONDITIONS[objId] ?? [];
        const isExpanded = expandedId === objId;
        const completed = player.completedObjectives.includes(objId);
        const catColor = CATEGORY_COLORS[def.category] ?? '#8a9a8e';

        return (
          <div
            key={objId}
            className={`floraison-card ${completed ? 'completed' : ''} ${isExpanded ? 'expanded' : ''}`}
            onClick={() => setExpandedId(isExpanded ? null : objId)}
          >
            <div className="floraison-card-header">
              <span className="floraison-card-dot" style={{ background: catColor }} />
              <span className="floraison-card-name">{def.name}</span>
              <span className="floraison-card-cat" style={{ color: catColor }}>[{def.category}]</span>
              {completed && <span className="floraison-card-check">&#10003;</span>}
              <span className={`floraison-card-arrow ${isExpanded ? 'open' : ''}`}>&#9662;</span>
            </div>

            {isExpanded && (
              <div className="floraison-card-body">
                <p className="floraison-card-desc">{def.description}</p>
                <div className="floraison-conditions">
                  {conditions.map((c, i) => (
                    <div key={i} className="floraison-condition">
                      <span className="floraison-cond-label">{c.label}</span>
                      <span className="floraison-cond-detail">{c.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
