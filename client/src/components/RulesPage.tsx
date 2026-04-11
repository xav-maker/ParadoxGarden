import { useState } from 'react';

interface RulesPageProps {
  onClose: () => void;
}

type Section = 'overview' | 'plants' | 'terrains' | 'time' | 'actions' | 'floraisons' | 'victory';

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'overview', label: 'Vue d\'ensemble' },
  { id: 'plants', label: 'Familles vegetales' },
  { id: 'terrains', label: 'Terrains' },
  { id: 'time', label: 'Temporalite' },
  { id: 'actions', label: 'Actions' },
  { id: 'floraisons', label: 'Floraisons-Signes' },
  { id: 'victory', label: 'Victoire et score' },
];

export function RulesPage({ onClose }: RulesPageProps) {
  const [activeSection, setActiveSection] = useState<Section>('overview');

  return (
    <div className="rules-page">
      <div className="rules-header">
        <h1>Regles du jeu</h1>
        <p className="rules-subtitle">Les Jardins du Paradoxe</p>
        <button className="rules-close-btn" onClick={onClose}>Retour</button>
      </div>

      <div className="rules-body">
        <nav className="rules-nav">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`rules-nav-btn ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => setActiveSection(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="rules-content">
          {activeSection === 'overview' && <OverviewSection />}
          {activeSection === 'plants' && <PlantsSection />}
          {activeSection === 'terrains' && <TerrainsSection />}
          {activeSection === 'time' && <TimeSection />}
          {activeSection === 'actions' && <ActionsSection />}
          {activeSection === 'floraisons' && <FloraisonsSection />}
          {activeSection === 'victory' && <VictorySection />}
        </div>
      </div>
    </div>
  );
}

/* ── Section Components ── */

function OverviewSection() {
  return (
    <div className="rules-section">
      <h2>Principe du jeu</h2>
      <p>
        Deux jardiniers rivaux cultivent un jardin paradoxal sur une grille 7x7.
        En semant des graines et en alterant le temps local des cases, ils tentent
        de faire eclore avant l'autre une <strong>Floraison-Signe</strong> : une
        configuration vegetale rare aux conditions precises.
      </p>

      <h3>Deroulement d'une partie</h3>
      <div className="rules-steps">
        <div className="rules-step">
          <span className="step-num">1</span>
          <div>
            <strong>Mise en place</strong>
            <p>Chaque joueur commence avec 3 Seve, 2 Charges de Temps, et recoit
            3 Floraisons-Signes secretes.</p>
          </div>
        </div>
        <div className="rules-step">
          <span className="step-num">2</span>
          <div>
            <strong>Tour par tour</strong>
            <p>A chaque tour, le joueur actif gagne des ressources puis effectue
            2 actions parmi les 6 disponibles.</p>
          </div>
        </div>
        <div className="rules-step">
          <span className="step-num">3</span>
          <div>
            <strong>Resolution</strong>
            <p>Apres les actions, les plantes evoluent selon le temps local, les
            effets passifs se declenchent, et les conditions de victoire sont verifiees.</p>
          </div>
        </div>
        <div className="rules-step">
          <span className="step-num">4</span>
          <div>
            <strong>Victoire</strong>
            <p>Le premier a realiser une Floraison-Signe gagne. Sinon, apres 15 tours,
            le joueur avec le plus de Points d'Harmonie l'emporte.</p>
          </div>
        </div>
      </div>

      <h3>Ressources</h3>
      <div className="rules-grid-2">
        <div className="rules-card">
          <div className="rules-card-header">
            <span className="rules-icon sap-icon" />
            <strong>Seve</strong>
          </div>
          <p>Ressource principale d'action. Gain : +1 par tour. Sert a semer,
          enraciner et disseminer.</p>
        </div>
        <div className="rules-card">
          <div className="rules-card-header">
            <span className="rules-icon time-icon" />
            <strong>Charges de Temps</strong>
          </div>
          <p>Permet de modifier la temporalite locale. Gain : +1 tous les 2 tours.
          Sert a accelerer, ralentir, inverser ou figer.</p>
        </div>
      </div>

      <h3>Cycle de vie des plantes</h3>
      <div className="rules-age-bar">
        <div className="rules-age-item">
          <span className="age-badge-rules">0</span>
          <span>Graine</span>
        </div>
        <span className="age-arrow">&rarr;</span>
        <div className="rules-age-item">
          <span className="age-badge-rules">1</span>
          <span>Pousse</span>
        </div>
        <span className="age-arrow">&rarr;</span>
        <div className="rules-age-item">
          <span className="age-badge-rules">2</span>
          <span>Mature</span>
        </div>
        <span className="age-arrow">&rarr;</span>
        <div className="rules-age-item">
          <span className="age-badge-rules">3</span>
          <span>Specialisee</span>
        </div>
        <span className="age-arrow">&rarr;</span>
        <div className="rules-age-item">
          <span className="age-badge-rules">4</span>
          <span>Fin de cycle</span>
        </div>
      </div>
      <p className="rules-note">
        L'age evolue chaque tour selon l'etat temporel de la case.
        L'age ne descend jamais sous 0. Au-dela du maximum, l'effet terminal
        de l'espece s'applique (decomposition, dissemination...).
      </p>
    </div>
  );
}

function PlantsSection() {
  return (
    <div className="rules-section">
      <h2>Familles vegetales</h2>
      <p>Quatre familles complementaires, chacune avec un role strategique distinct.</p>

      <div className="rules-plant-cards">
        <div className="rules-plant-card liane-card">
          <div className="rules-plant-header">
            <svg width="36" height="36" viewBox="0 0 36 36">
              <path d="M18 4 Q24 12 20 18 Q26 22 18 32 Q10 22 16 18 Q12 12 18 4Z"
                fill="#4caf6a" opacity="0.8" />
              <line x1="18" y1="6" x2="18" y2="30" stroke="#2d8f5e" strokeWidth="1.5" />
            </svg>
            <h3>Liane</h3>
          </div>
          <div className="rules-plant-role">Extension &middot; Connexion &middot; Chaines</div>
          <div className="rules-plant-body">
            <p>Se propage facilement et valorise les chaines et connexions. Utile pour
            relier des zones ou entourer des structures.</p>
            <div className="rules-plant-details">
              <div className="detail-row">
                <span className="detail-label">Comportement</span>
                <span>A maturite (age 2+), peut se propager vers les cases adjacentes vides compatibles.</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Force</span>
                <span>Forte presence spatiale, construction rapide de chaines.</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Faiblesse</span>
                <span>Sensible aux inversions temporelles qui brisent les sequences.</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Terrains</span>
                <span>Terre, Eau, Pierre, Vide fertile</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rules-plant-card moss-card">
          <div className="rules-plant-header">
            <svg width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="22" r="8" fill="#2d8f5e" opacity="0.7" />
              <circle cx="14" cy="16" r="5" fill="#3ecfa5" opacity="0.5" />
              <circle cx="22" cy="18" r="4" fill="#2d8f5e" opacity="0.6" />
            </svg>
            <h3>Mousse</h3>
          </div>
          <div className="rules-plant-role">Stabilisation &middot; Economie &middot; Defense</div>
          <div className="rules-plant-body">
            <p>Prefere les etats lents ou figes. Consolide des zones et genere des
            avantages durables.</p>
            <div className="rules-plant-details">
              <div className="detail-row">
                <span className="detail-label">Comportement</span>
                <span>A maturite (age 2+), genere +1 Seve par tour pour son proprietaire.</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Force</span>
                <span>Tres fiable, utile pour les structures defensives et l'economie.</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Faiblesse</span>
                <span>Peu explosive, ne contribue pas directement au controle spatial.</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Terrains</span>
                <span>Terre, Eau, Pierre, Vide fertile</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rules-plant-card voidflower-card">
          <div className="rules-plant-header">
            <svg width="36" height="36" viewBox="0 0 36 36">
              <polygon points="18,6 22,14 30,16 24,22 26,30 18,26 10,30 12,22 6,16 14,14"
                fill="#9b7ec8" opacity="0.7" />
              <circle cx="18" cy="18" r="3" fill="#c47ef0" opacity="0.8" />
            </svg>
            <h3>Fleur-Vide</h3>
          </div>
          <div className="rules-plant-role">Pivot &middot; Valeur rare &middot; Victoire</div>
          <div className="rules-plant-body">
            <p>Plus difficile a installer, elle intervient souvent dans les Floraisons-Signes
            et recompense la planification.</p>
            <div className="rules-plant-details">
              <div className="detail-row">
                <span className="detail-label">Comportement</span>
                <span>A l'age 3 (Specialisee), accorde des Points d'Harmonie.</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Force</span>
                <span>Haute valeur strategique, cle de certaines Floraisons.</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Faiblesse</span>
                <span>Vulnerable, doit etre protegee. Terrains compatibles limites.</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Terrains</span>
                <span>Terre, Vide fertile, Brume</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rules-plant-card echoshroom-card">
          <div className="rules-plant-header">
            <svg width="36" height="36" viewBox="0 0 36 36">
              <ellipse cx="18" cy="16" rx="10" ry="7" fill="#6b9fc3" opacity="0.6" />
              <rect x="16" y="22" width="4" height="10" rx="2" fill="#3a7ca5" opacity="0.7" />
              <circle cx="14" cy="14" r="1.5" fill="#a8e0f7" opacity="0.8" />
              <circle cx="22" cy="13" r="1" fill="#a8e0f7" opacity="0.6" />
            </svg>
            <h3>Champignon d'Echo</h3>
          </div>
          <div className="rules-plant-role">Perturbation &middot; Copie &middot; Opportunisme</div>
          <div className="rules-plant-body">
            <p>Profite des changements recents, se nourrit des fins de cycle,
            et copie ou reflete certains effets voisins.</p>
            <div className="rules-plant-details">
              <div className="detail-row">
                <span className="detail-label">Comportement</span>
                <span>A maturite, copie les effets des plantes voisines adverses.</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Force</span>
                <span>Excellent outil de contre et de perturbation adverse.</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Faiblesse</span>
                <span>Plus instable, anti-planification, dependant du contexte.</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Terrains</span>
                <span>Terre, Eau, Brume, Vide fertile</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TerrainsSection() {
  return (
    <div className="rules-section">
      <h2>Types de terrain</h2>
      <p>Le plateau 7x7 est compose de 5 types de terrain qui influencent la strategie.</p>

      <div className="rules-terrain-list">
        <div className="rules-terrain-row">
          <span className="terrain-swatch" style={{ background: '#6b5340' }} />
          <div className="terrain-info">
            <div className="terrain-header-row">
              <strong>Terre</strong>
              <span className="terrain-count">~27 cases</span>
            </div>
            <p>Terrain neutre, croissance normale. Toutes les especes peuvent y pousser.
            C'est la base du plateau.</p>
          </div>
        </div>

        <div className="rules-terrain-row">
          <span className="terrain-swatch" style={{ background: '#3a7ca5' }} />
          <div className="terrain-info">
            <div className="terrain-header-row">
              <strong>Eau</strong>
              <span className="terrain-count">~8 cases</span>
            </div>
            <p>Favorise certaines especes (Liane, Mousse, Champignon). Support important
            pour certaines Floraisons-Signes, notamment le Noeud de Rosee.</p>
            <p className="terrain-species">Especes compatibles : Liane, Mousse, Champignon d'Echo</p>
          </div>
        </div>

        <div className="rules-terrain-row">
          <span className="terrain-swatch" style={{ background: '#6a6e73' }} />
          <div className="terrain-info">
            <div className="terrain-header-row">
              <strong>Pierre</strong>
              <span className="terrain-count">~6 cases</span>
            </div>
            <p>Croissance plus rigide. Bonne base pour les effets de fixation (Enraciner).
            Incompatible avec les especes fragiles.</p>
            <p className="terrain-species">Especes compatibles : Liane, Mousse</p>
          </div>
        </div>

        <div className="rules-terrain-row">
          <span className="terrain-swatch" style={{ background: '#7a6a9e' }} />
          <div className="terrain-info">
            <div className="terrain-header-row">
              <strong>Brume</strong>
              <span className="terrain-count">~5 cases</span>
            </div>
            <p>Terrain instable qui favorise les interactions d'echo et de copie.
            Essentiel pour le Siphon des Brumes.</p>
            <p className="terrain-species">Especes compatibles : Fleur-Vide, Champignon d'Echo</p>
          </div>
        </div>

        <div className="rules-terrain-row">
          <span className="terrain-swatch" style={{ background: '#3a9a7a' }} />
          <div className="terrain-info">
            <div className="terrain-header-row">
              <strong>Vide fertile</strong>
              <span className="terrain-count">~3 cases</span>
            </div>
            <p>Rare et strategique. Terrain polyvalent compatible avec toutes les especes.
            Controler ces cases apporte un avantage significatif.</p>
            <p className="terrain-species">Especes compatibles : toutes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimeSection() {
  return (
    <div className="rules-section">
      <h2>Temporalite locale</h2>
      <p>Chaque case possede un etat temporel qui determine comment les plantes y evoluent
      lors de la phase de croissance. Les alterations durent 1 cycle puis la case revient a Normal.</p>

      <div className="rules-time-grid">
        <div className="rules-time-card">
          <div className="time-card-header" style={{ borderColor: '#8a9a8e' }}>
            <strong>Normal</strong>
            <span className="time-delta" style={{ color: '#8a9a8e' }}>age +1</span>
          </div>
          <p>Etat par defaut. La plante vieillit d'un age chaque tour.</p>
        </div>

        <div className="rules-time-card">
          <div className="time-card-header" style={{ borderColor: '#4de8c2' }}>
            <strong>Accelere</strong>
            <span className="time-delta" style={{ color: '#4de8c2' }}>age +2</span>
          </div>
          <p>La plante vieillit deux fois plus vite. Ideal pour forcer une maturation rapide,
          mais risque de depasser le stade optimal.</p>
          <p className="time-cost">Cout : 1 Charge de Temps</p>
        </div>

        <div className="rules-time-card">
          <div className="time-card-header" style={{ borderColor: '#9b7ec8' }}>
            <strong>Ralenti</strong>
            <span className="time-delta" style={{ color: '#9b7ec8' }}>age +0</span>
          </div>
          <p>La plante ne vieillit pas ce tour. Permet de maintenir un stade precis
          un tour supplementaire.</p>
          <p className="time-cost">Cout : 1 Charge de Temps</p>
        </div>

        <div className="rules-time-card">
          <div className="time-card-header" style={{ borderColor: '#c47ef0' }}>
            <strong>Inverse</strong>
            <span className="time-delta" style={{ color: '#c47ef0' }}>age -1</span>
          </div>
          <p>La plante rajeunit d'un age. Puissant pour saboter des plantes adverses ou
          satisfaire des conditions de regression. L'age ne descend jamais sous 0.</p>
          <p className="time-cost">Cout : 1 Charge de Temps</p>
        </div>

        <div className="rules-time-card">
          <div className="time-card-header" style={{ borderColor: '#a8e0f7' }}>
            <strong>Fige</strong>
            <span className="time-delta" style={{ color: '#a8e0f7' }}>aucun changement</span>
          </div>
          <p>Aucun changement d'age ni transformation. Securise une piece cle a un
          age precis, ou bloque un combo adverse.</p>
          <p className="time-cost">Cout : 2 Charges de Temps</p>
        </div>
      </div>

      <div className="rules-tip">
        <strong>A savoir :</strong> l'action Enraciner protege une plante alliee
        contre la prochaine alteration temporelle adverse.
      </div>
    </div>
  );
}

function ActionsSection() {
  return (
    <div className="rules-section">
      <h2>Actions</h2>
      <p>Chaque joueur effectue <strong>2 actions par tour</strong>. Voici les 6 actions disponibles.</p>

      <div className="rules-action-list">
        <div className="rules-action-card">
          <div className="action-card-header">
            <span className="action-card-num">1</span>
            <strong>Semer</strong>
            <span className="action-card-cost sap">1 Seve</span>
          </div>
          <p>Place une graine (age 0) d'une espece choisie sur une case vide.
          La case doit etre compatible avec l'espece.</p>
          <div className="action-constraints">
            <span>Case inoccupee</span>
            <span>Terrain compatible</span>
          </div>
        </div>

        <div className="rules-action-card">
          <div className="action-card-header">
            <span className="action-card-num">2</span>
            <strong>Alterer le temps</strong>
            <span className="action-card-cost time">1 Charge</span>
          </div>
          <p>Applique un etat temporel (Accelere, Ralenti ou Inverse) a une case
          pour le prochain cycle de croissance.</p>
          <div className="action-constraints">
            <span>Case sans effet temporel actif</span>
          </div>
        </div>

        <div className="rules-action-card">
          <div className="action-card-header">
            <span className="action-card-num">3</span>
            <strong>Figer</strong>
            <span className="action-card-cost time">2 Charges</span>
          </div>
          <p>Applique l'etat Fige a une case. Plus couteux mais tres puissant pour
          securiser un age precis ou bloquer un adversaire.</p>
          <div className="action-constraints">
            <span>Case sans effet temporel actif</span>
          </div>
        </div>

        <div className="rules-action-card">
          <div className="action-card-header">
            <span className="action-card-num">4</span>
            <strong>Recolter</strong>
            <span className="action-card-cost free">Gratuit</span>
          </div>
          <p>Detruit volontairement une plante alliee pour recuperer +1 Seve.
          Utile pour recycler une plante en fin de cycle ou liberer une case.</p>
          <div className="action-constraints">
            <span>Plante alliee uniquement</span>
          </div>
        </div>

        <div className="rules-action-card">
          <div className="action-card-header">
            <span className="action-card-num">5</span>
            <strong>Enraciner</strong>
            <span className="action-card-cost sap">1 Seve</span>
          </div>
          <p>Protege une plante alliee : elle ignorera la prochaine alteration temporelle.
          Essentiel pour securiser des pieces cles.</p>
          <div className="action-constraints">
            <span>Plante alliee non enracinee</span>
          </div>
        </div>

        <div className="rules-action-card">
          <div className="action-card-header">
            <span className="action-card-num">6</span>
            <strong>Disseminer</strong>
            <span className="action-card-cost sap">1 Seve</span>
          </div>
          <p>Cree une influence sur les cases adjacentes. En V1, reserve aux
          Champignons d'Echo : copie l'effet d'une plante voisine adverse.</p>
          <div className="action-constraints">
            <span>Champignon d'Echo allie uniquement</span>
          </div>
        </div>
      </div>

      <h3>Sequence de resolution d'un tour</h3>
      <div className="rules-sequence">
        <div className="seq-phase"><span className="seq-letter">A</span> Gain de ressources (+1 Seve, +1 Charge tous les 2 tours)</div>
        <div className="seq-phase"><span className="seq-letter">B</span> Le joueur effectue ses 2 actions</div>
        <div className="seq-phase"><span className="seq-letter">C</span> Croissance : chaque plante evolue selon le temps local</div>
        <div className="seq-phase"><span className="seq-letter">D</span> Effets de stade : propagation, generation de Seve, copie...</div>
        <div className="seq-phase"><span className="seq-letter">E</span> Nettoyage des effets temporaires expires</div>
        <div className="seq-phase"><span className="seq-letter">F</span> Verification des conditions de victoire</div>
      </div>
    </div>
  );
}

function FloraisonsSection() {
  return (
    <div className="rules-section">
      <h2>Floraisons-Signes</h2>
      <p>
        Ce sont les conditions de victoire principale. Chaque joueur recoit 3 Floraisons-Signes
        secretes en debut de partie. Realiser l'une d'entre elles <strong>en fin de resolution
        de votre tour</strong> vous donne la victoire immediate.
      </p>
      <p className="rules-note">
        Votre adversaire peut voir la <em>categorie</em> de vos objectifs (Amas, Centre, etc.)
        mais pas leur identite exacte.
      </p>

      <div className="rules-floraison-cards">
        {/* Noeud de Rosee */}
        <div className="rules-floraison-card">
          <div className="flor-header">
            <span className="flor-dot" style={{ background: '#3ecfa5' }} />
            <h3>Noeud de Rosee</h3>
            <span className="flor-cat" style={{ color: '#3ecfa5' }}>Amas</span>
          </div>
          <p className="flor-flavor">
            Quatre Mousses matures convergent en un carre humide, figees dans la rosee du temps.
          </p>
          <div className="flor-conditions">
            <div className="flor-cond">
              <span className="flor-cond-icon">&#9632;</span>
              <div>
                <strong>Forme :</strong> 4 Mousses en carre 2x2 (toutes adjacentes)
              </div>
            </div>
            <div className="flor-cond">
              <span className="flor-cond-icon">&#9632;</span>
              <div>
                <strong>Age :</strong> toutes matures (age &ge; 2)
              </div>
            </div>
            <div className="flor-cond">
              <span className="flor-cond-icon">&#9632;</span>
              <div>
                <strong>Terrain :</strong> au moins 1 des 4 cases sur terrain Eau
              </div>
            </div>
            <div className="flor-cond">
              <span className="flor-cond-icon">&#9632;</span>
              <div>
                <strong>Temps :</strong> au moins 1 case de la structure affectee par
                l'etat Fige ce tour ou au tour precedent
              </div>
            </div>
          </div>
        </div>

        {/* Couronne Retournee */}
        <div className="rules-floraison-card">
          <div className="flor-header">
            <span className="flor-dot" style={{ background: '#d4a843' }} />
            <h3>Couronne Retournee</h3>
            <span className="flor-cat" style={{ color: '#d4a843' }}>Centre</span>
          </div>
          <p className="flor-flavor">
            Une Fleur-Vide au coeur de quatre gardiennes qui ont connu le temps a rebours.
          </p>
          <div className="flor-conditions">
            <div className="flor-cond">
              <span className="flor-cond-icon">&#9632;</span>
              <div>
                <strong>Centre :</strong> 1 Fleur-Vide a l'age exact 2 (Mature)
              </div>
            </div>
            <div className="flor-cond">
              <span className="flor-cond-icon">&#9632;</span>
              <div>
                <strong>Forme :</strong> 4 plantes alliees sur les 4 cases orthogonales
                (haut, bas, gauche, droite) autour de la Fleur-Vide
              </div>
            </div>
            <div className="flor-cond">
              <span className="flor-cond-icon">&#9632;</span>
              <div>
                <strong>Condition :</strong> au moins 2 de ces 4 plantes doivent avoir
                subi une regression d'age (etat Inverse) a un moment de la partie
              </div>
            </div>
          </div>
        </div>

        {/* Siphon des Brumes */}
        <div className="rules-floraison-card">
          <div className="flor-header">
            <span className="flor-dot" style={{ background: '#7e8bc4' }} />
            <h3>Siphon des Brumes</h3>
            <span className="flor-cat" style={{ color: '#7e8bc4' }}>Contamination</span>
          </div>
          <p className="flor-flavor">
            Trois Champignons d'Echo relies aspirent la brume pour reproduire le vivant.
          </p>
          <div className="flor-conditions">
            <div className="flor-cond">
              <span className="flor-cond-icon">&#9632;</span>
              <div>
                <strong>Forme :</strong> 3 Champignons d'Echo connectes par adjacence orthogonale
              </div>
            </div>
            <div className="flor-cond">
              <span className="flor-cond-icon">&#9632;</span>
              <div>
                <strong>Terrain :</strong> au moins 2 des 3 Champignons sur des cases Brume
              </div>
            </div>
            <div className="flor-cond">
              <span className="flor-cond-icon">&#9632;</span>
              <div>
                <strong>Effet :</strong> 1 effet copie par un Champignon doit avoir eu lieu
                ce tour (via le comportement de copie passif)
              </div>
            </div>
          </div>
        </div>

        {/* Spirale Dormante */}
        <div className="rules-floraison-card">
          <div className="flor-header">
            <span className="flor-dot" style={{ background: '#4caf6a' }} />
            <h3>Spirale Dormante</h3>
            <span className="flor-cat" style={{ color: '#4caf6a' }}>Chaine</span>
          </div>
          <p className="flor-flavor">
            Une longue chaine de Lianes dont les ages decroissent jusqu'a une extremite immobilisee.
          </p>
          <div className="flor-conditions">
            <div className="flor-cond">
              <span className="flor-cond-icon">&#9632;</span>
              <div>
                <strong>Forme :</strong> chaine de Lianes alliees de longueur &ge; 5,
                connectees par adjacence orthogonale
              </div>
            </div>
            <div className="flor-cond">
              <span className="flor-cond-icon">&#9632;</span>
              <div>
                <strong>Extremite :</strong> l'une des extremites de la chaine doit etre
                sur une case avec l'etat Fige
              </div>
            </div>
            <div className="flor-cond">
              <span className="flor-cond-icon">&#9632;</span>
              <div>
                <strong>Sequence :</strong> les ages le long de la chaine doivent etre
                non croissants (chaque age &le; le precedent, depuis une extremite)
              </div>
            </div>
          </div>
        </div>

        {/* Miroir Verdoyant */}
        <div className="rules-floraison-card">
          <div className="flor-header">
            <span className="flor-dot" style={{ background: '#c47ef0' }} />
            <h3>Miroir Verdoyant</h3>
            <span className="flor-cat" style={{ color: '#c47ef0' }}>Symetrie</span>
          </div>
          <p className="flor-flavor">
            Un reflet parfait d'especes de part et d'autre du plateau, baigne dans le temps inverse.
          </p>
          <div className="flor-conditions">
            <div className="flor-cond">
              <span className="flor-cond-icon">&#9632;</span>
              <div>
                <strong>Forme :</strong> structure symetrique de plantes alliees
                (axe horizontal ou vertical du plateau)
              </div>
            </div>
            <div className="flor-cond">
              <span className="flor-cond-icon">&#9632;</span>
              <div>
                <strong>Symetrie :</strong> les especes doivent etre identiques en miroir,
                mais PAS les ages (les ages doivent differer)
              </div>
            </div>
            <div className="flor-cond">
              <span className="flor-cond-icon">&#9632;</span>
              <div>
                <strong>Temps :</strong> au moins 2 cases de la structure doivent avoir
                l'etat temporel Inverse
              </div>
            </div>
            <div className="flor-cond">
              <span className="flor-cond-icon">&#9632;</span>
              <div>
                <strong>Minimum :</strong> au moins 4 plantes dans la structure
                (2 paires symetriques minimum)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VictorySection() {
  return (
    <div className="rules-section">
      <h2>Conditions de victoire</h2>

      <div className="rules-victory-cards">
        <div className="rules-victory-card primary">
          <h3>Victoire par Floraison-Signe</h3>
          <p>
            Realisez l'une de vos 3 Floraisons-Signes secretes. La verification a lieu
            en fin de resolution de votre tour (phase F). Des qu'une Floraison est validee,
            la partie se termine immediatement en votre faveur.
          </p>
        </div>

        <div className="rules-victory-card secondary">
          <h3>Victoire aux Points d'Harmonie</h3>
          <p>
            Si aucune Floraison n'est realisee apres 15 tours, le joueur avec le plus
            de Points d'Harmonie l'emporte.
          </p>
          <h4>Sources de Points d'Harmonie</h4>
          <div className="harmony-sources">
            <div className="harmony-source">
              <span className="harmony-pts">+1</span>
              <span>Par plante mature (age &ge; 2) survivante</span>
            </div>
            <div className="harmony-source">
              <span className="harmony-pts">+2</span>
              <span>Par plante sur Vide fertile</span>
            </div>
            <div className="harmony-source">
              <span className="harmony-pts">+1</span>
              <span>Par Fleur-Vide a l'age 3 (Specialisee)</span>
            </div>
            <div className="harmony-source">
              <span className="harmony-pts">+3</span>
              <span>Par Floraison-Signe partiellement realisee (criteres presque remplis)</span>
            </div>
          </div>
        </div>
      </div>

      <h3>Interactions et strategie</h3>
      <div className="rules-strategy-grid">
        <div className="strategy-item">
          <strong>Sabotage temporel</strong>
          <p>Modifier l'age d'une plante adverse en alterant le temps de sa case.</p>
        </div>
        <div className="strategy-item">
          <strong>Blocage spatial</strong>
          <p>Occuper une case cle pour empecher un motif adverse.</p>
        </div>
        <div className="strategy-item">
          <strong>Pollution systemique</strong>
          <p>Placer une plante qui invalide ou detourne une structure adverse.</p>
        </div>
        <div className="strategy-item">
          <strong>Recyclage opportuniste</strong>
          <p>Profiter des destructions adverses pour alimenter sa progression.</p>
        </div>
        <div className="strategy-item">
          <strong>Pression de course</strong>
          <p>Forcer l'adversaire a defendre au lieu de developper son plan.</p>
        </div>
        <div className="strategy-item">
          <strong>Bluff</strong>
          <p>Developper des structures trompeuses pour masquer votre veritable objectif.</p>
        </div>
      </div>
    </div>
  );
}
