# Game Design Document V1 — *Les Jardins du Paradoxe*

## 1. Informations générales

### 1.1 Titre de travail

**Les Jardins du Paradoxe**

### 1.2 Genre

Jeu de stratégie compétitif au tour par tour, sur grille, asymétrie légère d'information, interactions systémiques.

### 1.3 Plateformes visées

* Web navigateur
* Mobile (iOS / Android)

### 1.4 Mode de jeu visé pour la V1

* 1 contre 1 en ligne
* Parties synchrones au tour par tour
* Base compatible avec un mode asynchrone futur

### 1.5 Angle différenciant

Le joueur ne manipule pas seulement des unités ou des cartes : il manipule la **croissance du vivant dans un espace soumis à des temporalités locales**. Le cœur du jeu consiste à provoquer des configurations de plateau précises en combinant :

* placement,
* timing,
* gestion d'âge,
* perturbation adverse,
* objectifs partiellement cachés.

### 1.6 Vision produit

Créer un jeu de stratégie lisible, profond et original, adapté aux interfaces tactiles, où chaque tour a un impact visible et compréhensible, sans nécessiter d'exécution en temps réel.

---

## 2. Pillars de design

### 2.1 Lisibilité stratégique

Le joueur doit comprendre rapidement :

* l'état du plateau,
* l'âge des plantes,
* les effets temporels actifs,
* les menaces adverses probables.

### 2.2 Profondeur émergente

Peu de règles de base, mais beaucoup d'interactions entre :

* espèces,
* âges,
* terrains,
* temps local,
* structures de victoire.

### 2.3 Tension de course et sabotage

La victoire n'est pas centrée sur des points de vie ou l'élimination, mais sur une course à la construction d'une forme rare, avec possibilité constante de sabotage indirect.

### 2.4 Compatibilité web/mobile native

Le jeu doit être agréable :

* à la souris,
* au tactile,
* en courtes sessions,
* avec un affichage clair des états.

### 2.5 Réalisabilité technique

Toutes les actions doivent être modélisables comme des changements d'état discrets, faciles à synchroniser via serveur et sockets.

---

## 3. High concept

Deux jardiniers rivaux cultivent un jardin paradoxal sur une grille vivante. En semant des graines et en altérant le temps local des cases, ils tentent de faire éclore avant l'autre une **Floraison-Signe**, une configuration végétale rare aux conditions précises.

Le jeu est une combinaison de :

* puzzle compétitif,
* contrôle de zone,
* programmation indirecte,
* bluff léger,
* combos systémiques.

---

## 4. Public cible

### 4.1 Cible principale

* joueurs de stratégie accessibles mais profondes,
* joueurs de jeux de plateau numériques,
* joueurs mobile recherchant du PvP intelligent non temps réel.

### 4.2 Cible secondaire

* joueurs de jeux tactiques,
* joueurs appréciant les systèmes émergents,
* public indé attiré par des concepts originaux.

### 4.3 Session type

* 10 à 20 minutes pour une partie standard V1
* possibilité future de parties asynchrones sur plusieurs heures/jours

---

## 5. Expérience joueur recherchée

Le joueur doit ressentir :

* la satisfaction d'orchestrer un écosystème,
* la tension de préparer une structure sans trop la révéler,
* le plaisir de contrer une combinaison adverse au dernier moment,
* la montée en complexité naturelle du plateau,
* la sensation que chaque case compte.

Le jeu doit éviter :

* la surcharge de règles dès le premier match,
* le chaos illisible,
* les tours trop longs,
* la frustration liée à des effets arbitraires.

---

## 6. Boucle de jeu

### 6.1 Boucle macro

1. Entrer dans une partie
2. Recevoir des objectifs de Floraison-Signe
3. Développer son jardin
4. Lire les intentions adverses
5. Construire / saboter / sécuriser
6. Déclencher une Floraison-Signe ou gagner aux points

### 6.2 Boucle de tour

1. Début de tour : gain de ressources
2. Le joueur effectue ses actions
3. Résolution de la croissance
4. Résolution des effets passifs / mutations / décomposition
5. Vérification des structures et conditions de victoire
6. Passage du tour

---

## 7. Structure d'une partie

### 7.1 Mise en place

* Plateau : 7x7
* Répartition de terrains spéciaux prédéfinie ou semi-aléatoire contrôlée
* Chaque joueur commence avec :

  * 3 Sève
  * 2 Charges de Temps
  * un set de graines de base
  * 3 Floraisons-Signes secrètes tirées d'un pool

### 7.2 Durée cible

* 12 à 15 tours par joueur
* Fin anticipée si Floraison-Signe validée
* Fin aux points si limite atteinte

### 7.3 Conditions de victoire

**Victoire principale** : réaliser une Floraison-Signe valide en fin de résolution de son tour.

**Victoire secondaire** : à la limite de tours, avoir le plus de Points d'Harmonie.

---

## 8. Plateau et représentation

### 8.1 Dimensions

* V1 : 7 colonnes x 7 lignes

### 8.2 Types de terrain V1

#### Terre

* terrain neutre
* croissance normale

#### Eau

* favorise certaines espèces
* support important pour certaines Floraisons

#### Pierre

* croissance plus rigide selon espèces
* bonne base pour effets de fixation

#### Brume

* terrain instable
* favorise certaines interactions d'écho et de copie

#### Vide fertile

* rare
* terrain stratégique polyvalent

### 8.3 Informations contenues par case

Chaque case possède :

* coordonnées
* type de terrain
* état temporel
* occupant éventuel
* propriétaire éventuel
* effets temporaires

---

## 9. Ressources

### 9.1 Sève

Ressource principale d'action.

Usages V1 :

* semer une graine
* protéger une plante
* déclencher certaines actions spéciales

### 9.2 Charges de Temps

Ressource permettant de modifier la temporalité locale.

Usages V1 :

* accélérer
* ralentir
* inverser
* figer

### 9.3 Spores (option V1.1 ou V2)

Ressource secondaire issue de la décomposition ou des champignons. Peut être mise de côté pour le prototype si besoin de simplification.

---

## 10. Temporalité locale

### 10.1 Principe

Chaque case a un état temporel appliqué pendant la phase de croissance.

### 10.2 États temporels V1

#### Normal

* évolution de l'âge : +1

#### Accéléré

* évolution de l'âge : +2

#### Ralenti

* évolution de l'âge : +0

#### Inversé

* évolution de l'âge : -1

#### Figé

* aucun changement d'âge ni transformation pendant la phase concernée

### 10.3 Règles de durée

Pour la V1, un changement temporel dure **1 cycle complet** puis la case revient à Normal, sauf effet spécifique.

### 10.4 Intention design

Le temps local est :

* puissant,
* visible,
* temporaire,
* source de combos,
* principal levier de contre.

---

## 11. Âge et cycle de vie des plantes

### 11.1 Échelle d'âge V1

* 0 : Graine
* 1 : Pousse
* 2 : Mature
* 3 : Forme spécialisée
* 4 : Fin de cycle / Décomposition / Dissémination selon espèce

### 11.2 Règle générale

L'âge d'une plante évolue à la phase de croissance selon l'état temporel de sa case.

### 11.3 Bornes

* l'âge ne peut pas descendre sous 0
* si l'âge dépasse le maximum géré par l'espèce, on applique l'effet terminal de l'espèce

### 11.4 Intention design

Le stade optimal d'une plante est souvent transitoire. Le joueur doit donc :

* préparer,
* maintenir,
* figer,
* ou faire régresser un état au bon moment.

---

## 12. Familles végétales V1

### 12.1 Objectif du roster V1

Avoir peu d'espèces, mais très lisibles et complémentaires.

### 12.2 Liane

**Rôle** : extension, connexion, construction de formes.

**Comportement général** :

* se propage facilement,
* valorise les chaînes et connexions,
* utile pour entourer ou relier.

**Identité mécanique** :

* forte présence spatiale,
* dépendante du bon timing,
* sensible aux inversions.

### 12.3 Mousse

**Rôle** : stabilisation, économie, contrôle passif.

**Comportement général** :

* préfère les états lents ou figés,
* consolide des zones,
* génère des avantages de durée.

**Identité mécanique** :

* peu explosive,
* très fiable,
* utile pour les structures défensives et certains objectifs.

### 12.4 Fleur-Vide

**Rôle** : centre de structure, pièce rare, pivot de victoire.

**Comportement général** :

* plus difficile à installer,
* intervient souvent dans les Floraisons-Signes,
* récompense la planification.

**Identité mécanique** :

* haute valeur stratégique,
* vulnérable,
* doit souvent être protégée.

### 12.5 Champignon d'Écho

**Rôle** : perturbation, recyclage, opportunisme.

**Comportement général** :

* profite des changements récents,
* se nourrit des fins de cycle,
* copie ou reflète certains effets voisins.

**Identité mécanique** :

* anti-planification,
* excellent outil de contre,
* plus instable que les autres familles.

---

## 13. Actions du joueur

Chaque joueur effectue **2 actions par tour**.

### 13.1 Semer

**Coût** : 1 Sève

**Effet** : place une graine d'une espèce autorisée sur une case valide.

**Contraintes** :

* case inoccupée,
* terrain compatible,
* parfois portée ou condition de voisinage selon équilibrage.

### 13.2 Altérer le temps

**Coût** : 1 Charge de Temps

**Effet** : applique à une case l'un des états temporels suivants pour le prochain cycle :

* Accéléré
* Ralenti
* Inversé

**Contraintes V1** :

* une même case ne peut pas recevoir plusieurs altérations temporelles sur le même tour

### 13.3 Figer

**Coût** : 2 Charges de Temps

**Effet** : applique l'état Figé pour le prochain cycle.

**Usage design** :

* sécuriser une pièce clé,
* conserver un âge précis,
* bloquer un combo adverse.

### 13.4 Récolter

**Coût** : 1 action

**Effet** : détruit volontairement une plante alliée pour générer un bénéfice.

**Bénéfices possibles V1** :

* +1 Sève
* ou effet simplifié propre à l'espèce

### 13.5 Enraciner

**Coût** : 1 Sève

**Effet** : une plante alliée ignore la prochaine altération temporelle ou bénéficie d'une protection légère contre un effet adverse.

### 13.6 Disséminer

**Coût** : 1 Sève ou ressource dérivée

**Effet** : crée une influence légère sur des cases adjacentes.

Pour la V1 prototype, cette action peut être limitée aux Champignons d'Écho.

---

## 14. Séquence détaillée d'un tour

### 14.1 Phase A — Début de tour

* gain de 1 Sève
* gain périodique de Charges de Temps selon règle choisie
* résolution d'effets "au début du tour"

### 14.2 Phase B — Actions du joueur

Le joueur effectue 2 actions parmi la liste disponible.

### 14.3 Phase C — Croissance

Chaque plante évolue selon l'état temporel de sa case.

### 14.4 Phase D — Effets de stade

Selon leur nouvelle valeur d'âge, certaines plantes :

* produisent une ressource,
* se propagent,
* se décomposent,
* copient un effet,
* déclenchent une capacité passive.

### 14.5 Phase E — Nettoyage des effets temporaires

* les altérations de temps expirées reviennent à Normal
* suppression des marqueurs temporaires consommés

### 14.6 Phase F — Vérification de victoire

* vérification des Floraisons-Signes du joueur actif
* si aucune victoire, passage du tour à l'adversaire

---

## 15. Floraisons-Signes

### 15.1 Définition

Une Floraison-Signe est une configuration de plateau répondant à une condition stricte de :

* positions,
* espèces,
* âges,
* temporalités,
* parfois terrains.

### 15.2 Rôle

* condition de victoire principale
* moteur de variété
* support du bluff et de la lecture adverse

### 15.3 Distribution

Chaque joueur reçoit **3 Floraisons-Signes secrètes** parmi un pool commun.

### 15.4 Information partagée

Pour la V1, deux options :

#### Option simple

Les Floraisons sont totalement secrètes.

#### Option recommandée

L'adversaire voit la **catégorie** de chaque objectif adverse, par exemple :

* chaîne
* centre
* symétrie
* amas
* contamination

Cette option améliore la lecture et réduit le sentiment d'aléatoire.

### 15.5 Exemples de Floraisons-Signes V1

#### Nœud de Rosée

* 4 Mousses matures en carré 2x2
* au moins 1 sur Eau
* au moins 1 case de la structure affectée par Figé ce tour ou au tour précédent

#### Couronne Retournée

* 1 Fleur-Vide au centre à âge 2
* 4 plantes orthogonales autour
* au moins 2 de ces plantes ont subi une régression d'âge pendant la partie

#### Siphon des Brumes

* 3 Champignons d'Écho connectés
* au moins 2 sur cases Brume
* 1 effet copié ce tour

#### Spirale Dormante

* chaîne de Lianes de longueur 5 minimum
* extrémité figée
* séquence d'âges non croissante

#### Miroir Verdoyant

* structure symétrique entre deux zones du plateau
* symétrie sur les espèces mais non sur les âges
* présence d'au moins 2 cases Inversées dans l'ensemble

---

## 16. Points d'Harmonie

### 16.1 Rôle

Système de départage et score secondaire.

### 16.2 Sources V1 possibles

* contrôle de cases spéciales
* structures partielles complètes
* nombre de plantes matures survivantes
* Floraisons incomplètes avancées
* déclenchements rares

### 16.3 Intention design

Permettre :

* de gagner même si aucune Floraison n'aboutit,
* d'éviter les parties verrouillées,
* de valoriser la maîtrise du plateau.

---

## 17. Interaction entre joueurs

### 17.1 Types d'interactions recherchées

#### Sabotage temporel

Modifier l'âge utile d'une pièce adverse.

#### Blocage spatial

Occuper une case-clé pour empêcher un motif.

#### Pollution systémique

Ajouter une entité qui invalide ou détourne une structure.

#### Recyclage opportuniste

Profiter des destructions adverses pour alimenter sa propre progression.

#### Pression de course

Forcer l'adversaire à défendre au lieu de développer son plan.

### 17.2 Ce que le jeu évite volontairement

* combat frontal classique à points de vie,
* suppression massive d'unités,
* snowball trop brutal dès les premiers tours.

---

## 18. Informations cachées et bluff

### 18.1 Informations publiques

* état du plateau
* ressources visibles
* effets temporels visibles
* historique des tours

### 18.2 Informations privées

* Floraisons-Signes exactes
* éventuellement la main de graines si on choisit ce système plus tard

### 18.3 Impact design

Le bluff naît de la divergence entre :

* ce que le plateau suggère,
* ce que le joueur cherche réellement.

---

## 19. UX / UI V1

### 19.1 Objectif UX

Rendre un système potentiellement riche immédiatement compréhensible.

### 19.2 Informations visibles sur une case

* type de terrain
* occupant
* âge
* propriétaire
* état temporel
* marqueur de protection éventuel

### 19.3 Affichage recommandé

#### Desktop

* plateau centré
* panneau latéral pour ressources, objectifs, historique
* survol pour détails de case

#### Mobile

* plateau plein écran
* sélection par tap
* panneau contextuel en bas
* icônes simples et lisibles
* mode "prévisualisation de résolution" conseillé

### 19.4 Feedback indispensables

* prévisualisation avant validation d'une action
* animation courte de croissance
* journal des changements de tour
* mise en évidence des menaces proches d'une Floraison

---

## 20. Accessibilité et lisibilité

### 20.1 Priorités

* ne pas dépendre uniquement de la couleur
* icônes distinctes par temporalité
* lisibilité des âges à petite taille
* animations courtes désactivables

### 20.2 Bonnes pratiques

* code visuel double : couleur + symbole
* contraste fort
* indication textuelle au tap long ou survol

---

## 21. Direction artistique fonctionnelle V1

### 21.1 Cible artistique

Un univers végétal mystérieux, élégant, presque scientifique-fantastique.

### 21.2 Contraintes de production V1

* formes très lisibles
* silhouettes simples
* distinction immédiate entre familles
* faible dépendance à des animations complexes

### 21.3 Intention visuelle

Chaque élément doit évoquer :

* le vivant,
* la mutation,
* la géométrie,
* le temps.

---

## 22. Son et feedback audio

### 22.1 Objectif

Renforcer la lecture d'état sans surcharge.

### 22.2 Besoins V1

* son de pose
* son de croissance
* son d'inversion temporelle
* son de validation d'objectif / alerte de menace

---

## 23. Équilibrage V1

### 23.1 Objectifs d'équilibrage

* aucune famille ne doit être auto-suffisante
* le temps local doit être puissant mais coûteux
* les Floraisons doivent être atteignables sans être triviales
* les matchs doivent offrir du contre-jeu jusqu'aux derniers tours

### 23.2 Leviers principaux

* coût en Sève
* coût en Charges de Temps
* fréquence des gains de ressources
* nombre d'actions par tour
* durée des altérations temporelles
* rareté des terrains spéciaux
* difficulté des Floraisons-Signes

### 23.3 Risques à surveiller

* verrouillage du plateau
* trop forte domination du sabotage sur la construction
* stratégies déterministes répétitives
* objectif secret impossible à lire ou à contrer

---

## 24. Portée recommandée pour le prototype V1

### 24.1 Contenu minimal jouable

* plateau 7x7
* 4 types de terrain
* 4 familles végétales
* 5 Floraisons-Signes
* 2 ressources : Sève / Temps
* 5 actions principales
* 1 mode PvP en ligne

### 24.2 Réductions possibles pour MVP technique

Si besoin, commencer avec :

* 3 familles végétales au lieu de 4
* 3 Floraisons-Signes seulement
* pas de Spores
* pas de Dissémination globale
* un seul format de carte fixe

---

## 25. Spécification de prototype recommandée

### 25.1 Objectif du prototype

Valider :

* le plaisir du cœur de boucle,
* la lisibilité,
* la richesse du temps local,
* la tension entre construction et sabotage.

### 25.2 Contenu prototype conseillé

* Liane, Mousse, Fleur-Vide
* états temporels : Normal, Accéléré, Inversé, Figé
* 3 Floraisons-Signes seulement
* aucune information cachée avancée au premier test

### 25.3 Questions à valider en playtest

* Le jeu est-il compréhensible en moins de 10 minutes ?
* Le système temporel est-il amusant ou trop abstrait ?
* Le sabotage est-il satisfaisant sans être frustrant ?
* Les objectifs donnent-ils envie d'anticiper ?
* Les tours restent-ils assez courts ?

---

## 26. Structure de données conceptuelle

### 26.1 Case

* x
* y
* terrainType
* timeState
* occupantId nullable
* effects[]

### 26.2 Occupant / Plante

* id
* ownerId
* speciesType
* age
* rooted boolean
* metadata

### 26.3 Joueur

* id
* sève
* timeCharges
* secretObjectives[]
* scoreHarmony

### 26.4 Partie

* gameId
* board
* players
* activePlayerId
* turnNumber
* actionHistory
* winner nullable

---

## 27. Architecture gameplay compatible réseau

### 27.1 Principe

Le serveur est autoritaire. Le client envoie des intentions d'action.

### 27.2 Envoi d'un tour

Le client envoie par sockets :

* gameId
* playerId
* action1
* action2
* éventuellement ordre et cibles

### 27.3 Résolution

Le serveur :

* valide la légalité,
* applique les actions,
* résout la croissance,
* calcule les effets,
* vérifie la victoire,
* renvoie le nouvel état.

### 27.4 Avantages

* synchronisation simple,
* anti-triche plus robuste,
* replay / historique facilité,
* compatibilité asynchrone future.

---

## 28. Choix techniques implicites du design

Le design favorise :

* un état de partie discret,
* peu de calculs lourds côté client,
* résolution déterministe,
* animation purement cosmétique,
* prise en charge simple du web et du mobile.

---

## 29. Modes de jeu futurs

### 29.1 Asynchrone

Un joueur joue son tour, l'autre reçoit une notification.

### 29.2 Classé

MMR / Elo simple avec saisons.

### 29.3 Solo puzzle

Situations imposées à résoudre en X tours.

### 29.4 Draft / deckbuilding léger

Sélection de graines et d'objectifs avant match.

---

## 30. Roadmap de production design

### 30.1 Étape 1 — Prototype papier / simulateur

* tester les règles de croissance
* tester 3 Floraisons
* vérifier la lisibilité des âges

### 30.2 Étape 2 — Prototype jouable numérique

* grille interactive
* placement
* altération du temps
* résolution automatique
* jeu local hotseat ou 2 navigateurs

### 30.3 Étape 3 — Vertical slice réseau

* parties en ligne via sockets
* historique des tours
* interface lisible desktop/mobile

### 30.4 Étape 4 — Itération d'équilibrage

* ajuster coûts
* ajuster pool d'objectifs
* améliorer UX

---

## 31. Risques projet

### 31.1 Risques design

* trop d'états pour la V1
* objectifs trop cryptiques
* manque de lisibilité mobile
* contre-jeu insuffisant

### 31.2 Risques production

* ambition trop large en contenu
* surcharge UI sur petit écran
* complexité prématurée du matchmaking et des profils

### 31.3 Réponse recommandée

Toujours privilégier :

* peu de contenu,
* règles claires,
* prototype testable rapidement,
* instrumentation de playtest.

---

## 32. Décisions fermes recommandées pour démarrer

Pour éviter la dérive, je recommande de figer immédiatement ces choix V1 :

1. Plateau 7x7
2. 2 actions par tour
3. 2 ressources principales : Sève et Temps
4. 4 familles végétales maximum
5. 5 Floraisons-Signes maximum dans le premier prototype
6. Durée des altérations temporelles limitée à 1 cycle
7. Serveur autoritaire pour la résolution
8. Desktop d'abord, mobile-compatible dès la conception

---

## 33. Résumé exécutif

*Les Jardins du Paradoxe* est un jeu de stratégie tour par tour où deux joueurs cultivent et manipulent un jardin soumis à des temporalités locales. Le but est de faire émerger une structure rare, la Floraison-Signe, avant son adversaire. La profondeur naît de la combinaison entre placement, croissance, âges, altérations temporelles et sabotage indirect.

Le concept est particulièrement adapté à une réalisation web/mobile, car son état de jeu est discret, son rythme est lisible, et sa résolution se prête très bien à une architecture serveur + sockets.

---

## 34. Annexe — Version ultra-courte des règles V1

* Partie sur grille 7x7
* Chaque joueur dispose de Sève et de Charges de Temps
* À son tour, un joueur gagne des ressources puis effectue 2 actions
* Il peut semer, altérer le temps d'une case, figer, récolter ou protéger
* Les plantes vieillissent ensuite selon le temps local de leur case
* Certaines structures spéciales, les Floraisons-Signes, donnent la victoire
* Si personne ne réussit, la partie se termine aux Points d'Harmonie
