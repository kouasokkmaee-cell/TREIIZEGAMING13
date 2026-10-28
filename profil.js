/* =========================================================
   Page « Ton profil gamer »
   - choix des jeux (plusieurs possibles)
   - choix de la plateforme et du style (un seul)
   - barre d'XP qui se remplit
   - le bouton ne s'active qu'avec 1 jeu minimum + 18 ans confirmés
   ========================================================= */

var JEUX = [
  { id: 'cod', nom: 'Call of Duty' },
  { id: 'fortnite', nom: 'Fortnite' },
  { id: 'fc', nom: 'FIFA / EA FC' },
  { id: 'gta', nom: 'GTA' },
  { id: 'freefire', nom: 'Free Fire' },
  { id: 'efootball', nom: 'eFootball' }
];
var PLATEFORMES = [
  { id: 'mobile', nom: 'Mobile' },
  { id: 'playstation', nom: 'PlayStation' },
  { id: 'xbox', nom: 'Xbox' },
  { id: 'pc', nom: 'PC' }
];
var STYLES = [
  { id: 'chill', nom: 'Chill' },
  { id: 'tryhard', nom: 'Tryhard' },
  { id: 'coop', nom: 'Coop / duo' }
];

// On reprend le profil déjà enregistré, s'il existe
var ancien = Stockage.lire() || {};
var etat = {
  pseudo: ancien.pseudo || '',
  idJeu: ancien.idJeu || '',
  jeux: ancien.jeux || ['cod', 'fc'],
  plateforme: ancien.plateforme || 'mobile',
  style: ancien.style || 'chill',
  majeur: false // on redemande toujours la confirmation d'âge
};

var iconeCoche = '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';

// Crée un bouton « appuyable » (aria-pressed indique s'il est sélectionné)
function creerBouton(classe, texte, actif, auClic) {
  var bouton = document.createElement('button');
  bouton.type = 'button';
  bouton.className = classe;
  bouton.setAttribute('aria-pressed', actif ? 'true' : 'false');
  bouton.addEventListener('click', auClic);
  if (classe === 'puce' && actif) {
    bouton.innerHTML = iconeCoche;
  }
  bouton.appendChild(document.createTextNode(texte));
  return bouton;
}

function afficherJeux() {
  var zone = document.getElementById('liste-jeux');
  zone.innerHTML = '';
  JEUX.forEach(function (jeu) {
    var actif = etat.jeux.indexOf(jeu.id) !== -1;
    zone.appendChild(creerBouton('puce', jeu.nom, actif, function () {
      if (actif) {
        etat.jeux = etat.jeux.filter(function (id) { return id !== jeu.id; });
      } else {
        etat.jeux = etat.jeux.concat(jeu.id);
      }
      afficherJeux();
      mettreAJour();
    }));
  });
}

function afficherChoixUnique(idZone, liste, cle, classe) {
  var zone = document.getElementById(idZone);
  zone.innerHTML = '';
  liste.forEach(function (option) {
    zone.appendChild(creerBouton(classe, option.nom, etat[cle] === option.id, function () {
      etat[cle] = option.id;
      afficherChoixUnique(idZone, liste, cle, classe);
      mettreAJour();
    }));
  });
}

// Recalcule l'XP et active ou non le bouton
function mettreAJour() {
  var xp = 20;
  if (etat.pseudo.trim().length >= 3) xp += 15;
  xp += Math.min(etat.jeux.length, 3) * 10;
  if (etat.majeur) xp += 35;
  xp = Math.min(100, xp);

  document.getElementById('xp-valeur').textContent = xp;
  document.getElementById('xp-rempli').style.width = xp + '%';
  document.getElementById('xp-barre').setAttribute('aria-valuenow', xp);

  var pret = etat.jeux.length > 0 && etat.majeur;
  var bouton = document.getElementById('btn-lancer');
  bouton.disabled = !pret;
  document.getElementById('btn-texte').textContent = pret
    ? 'ENTRER DANS LA VILLE'
    : 'CHOISIS UN JEU ET CONFIRME TON ÂGE';
}

// Champ pseudo
var champPseudo = document.getElementById('pseudo');
champPseudo.value = etat.pseudo;
champPseudo.addEventListener('input', function () {
  etat.pseudo = champPseudo.value;
  mettreAJour();
});

// Identifiant de jeu
var champId = document.getElementById('id-jeu');
champId.value = etat.idJeu;
champId.addEventListener('input', function () { etat.idJeu = champId.value; });

// Case 18 ans
document.getElementById('majeur').addEventListener('change', function (e) {
  etat.majeur = e.target.checked;
  mettreAJour();
});

// Envoi du formulaire : on enregistre puis on entre dans la ville (le Hub)
document.getElementById('formulaire').addEventListener('submit', function (e) {
  e.preventDefault();
  if (!(etat.jeux.length > 0 && etat.majeur)) return;
  Stockage.ecrire({
    pseudo: etat.pseudo.trim() || 'Joueur',
    idJeu: etat.idJeu.trim(),
    jeux: etat.jeux,
    plateforme: etat.plateforme,
    style: etat.style
  });
  // XP : la quête « Complète ton profil » et deux badges
  XP.avancerQuete('profil');
  XP.badge('profil-complet');
  XP.badge('bienvenue');
  // On laisse l'animation « +XP » se jouer avant de changer de page
  setTimeout(function () { window.location.href = 'hub.html'; }, 1100);
});

afficherJeux();
afficherChoixUnique('liste-plateformes', PLATEFORMES, 'plateforme', 'case');
afficherChoixUnique('liste-styles', STYLES, 'style', 'choix');
mettreAJour();
