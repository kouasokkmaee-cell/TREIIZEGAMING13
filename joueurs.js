/* =========================================================
   Joueurs de DÉMONSTRATION (profils inventés).
   À l'étape 2, cette liste sera remplacée par les vrais
   profils enregistrés dans Supabase.
   ========================================================= */

var NOMS_JEUX = {
  cod: 'Call of Duty',
  fortnite: 'Fortnite',
  fc: 'FIFA / EA FC',
  gta: 'GTA',
  freefire: 'Free Fire',
  efootball: 'eFootball'
};

var JOUEURS_DEMO = [
  {
    id: 'aya', nom: 'Aya', age: 23, ville: 'Cocody · Abidjan', initiales: 'AY', couleur: '#C6FF3D',
    main: 'Call of Duty Mobile', plateforme: 'Mobile', jeux: ['cod', 'fc'], style: 'Duo',
    bio: 'Snipeuse le soir, défenseure centrale le week-end. Si tu me bats à FC, je paie le garba.',
    dispo: 'Dispo ce soir dès 21h'
  },
  {
    id: 'yann', nom: 'Yann', age: 26, ville: 'Yopougon · Abidjan', initiales: 'YK', couleur: '#3DF5FF',
    main: 'Fortnite', plateforme: 'PlayStation', jeux: ['fortnite', 'gta'], style: 'Chill',
    bio: 'Constructeur plus que tireur. Je cherche quelqu’un pour finir le mode histoire de GTA en coop.',
    dispo: 'Dispo le week-end'
  },
  {
    id: 'mariam', nom: 'Mariam', age: 22, ville: 'Bouaké', initiales: 'MB', couleur: '#FFB23D',
    main: 'Free Fire', plateforme: 'Mobile', jeux: ['freefire', 'efootball'], style: 'Tryhard',
    bio: 'Top 1 ou rien. Mais je suis gentille en dehors de la zone de jeu, promis.',
    dispo: 'Dispo en semaine après 19h'
  }
];

/* Joueurs connectés en ce moment dans la DUO ZONE (démonstration).
   idJeu = l'identifiant qu'on se donne pour s'ajouter dans le jeu. */
var DUOS_DEMO = [
  { pseudo: 'Babi_Builder', ini: 'BB', couleur: '#3DF5FF', commune: 'Yopougon', jeux: ['fortnite'], plateformes: ['playstation', 'pc'], rang: 'PRO', micro: true, style: 'Tryhard', idJeu: 'BabiBuilder225', depuis: 2 },
  { pseudo: 'Kady.ff', ini: 'KD', couleur: '#FF4D8D', commune: 'Cocody', jeux: ['fortnite', 'freefire'], plateformes: ['mobile'], rang: 'SOLDAT', micro: true, style: 'Chill', idJeu: 'Kady_ff', depuis: 5 },
  { pseudo: 'Zigzag07', ini: 'ZZ', couleur: '#FFB23D', commune: 'Abobo', jeux: ['fortnite', 'cod'], plateformes: ['xbox', 'pc'], rang: 'SOLDAT', micro: false, style: 'Coop / duo', idJeu: 'Zigzag07CI', depuis: 1 },
  { pseudo: 'Lion2Marcory', ini: 'LM', couleur: '#C6FF3D', commune: 'Marcory', jeux: ['cod'], plateformes: ['mobile'], rang: 'LÉGENDE', micro: true, style: 'Tryhard', idJeu: 'Lion2Marcory', depuis: 8 },
  { pseudo: 'Sniper_Nina', ini: 'SN', couleur: '#9B7BFF', commune: 'Plateau', jeux: ['cod', 'gta'], plateformes: ['playstation'], rang: 'PRO', micro: true, style: 'Coop / duo', idJeu: 'SniperNina_225', depuis: 3 },
  { pseudo: 'Drogba2.0', ini: 'D2', couleur: '#FF4D8D', commune: 'Treichville', jeux: ['fc', 'efootball'], plateformes: ['playstation'], rang: 'PRO', micro: true, style: 'Tryhard', idJeu: 'Drogba2point0', depuis: 4 },
  { pseudo: 'Mimi_Dribble', ini: 'MD', couleur: '#3DF5FF', commune: 'Bingerville', jeux: ['fc'], plateformes: ['xbox', 'pc'], rang: 'SOLDAT', micro: false, style: 'Chill', idJeu: 'MimiDribble', depuis: 6 },
  { pseudo: 'Kouame_e', ini: 'KE', couleur: '#C6FF3D', commune: 'Bouaké', jeux: ['efootball', 'freefire'], plateformes: ['mobile'], rang: 'ROOKIE', micro: true, style: 'Chill', idJeu: 'KouameE', depuis: 2 },
  { pseudo: 'NuitDeBabi', ini: 'NB', couleur: '#9B7BFF', commune: 'Koumassi', jeux: ['gta'], plateformes: ['pc', 'playstation'], rang: 'PRO', micro: true, style: 'Coop / duo', idJeu: 'NuitDeBabi', depuis: 7 },
  { pseudo: 'Fanta.Headshot', ini: 'FH', couleur: '#FFB23D', commune: 'Port-Bouët', jeux: ['freefire'], plateformes: ['mobile'], rang: 'LÉGENDE', micro: true, style: 'Tryhard', idJeu: 'FantaHeadshot', depuis: 1 }
];
