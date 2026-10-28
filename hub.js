/* =========================================================
   LE HUB : la place centrale de TREIIZE CITY
   - affiche ton personnage (pseudo, rang, XP)
   - la carte de la ville (Love Zone ouverte, le reste par saison)
   - les quêtes de la semaine, tes badges, l'actu de la ville
   ========================================================= */

var profil = Stockage.lire();

// Pas encore de profil ? On envoie créer son perso d'abord.
if (!profil) {
  window.location.replace('profil.html');
}

var pseudo = (profil && profil.pseudo) || 'Joueur';
var initiales = pseudo.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || '?';

document.getElementById('perso-pseudo').textContent = pseudo;
document.getElementById('perso-avatar').textContent = initiales;
document.getElementById('avatar-petit').textContent = initiales;

XP.badge('bienvenue');

var iconeCoche = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';
var iconeBadge = '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/></svg>';

var rangPrecedent = null;

function afficher() {
  var e = XP.etat();

  // --- Personnage ---
  document.getElementById('xp-total').textContent = e.xp;
  document.getElementById('rang-nom').textContent = e.rang.nom;
  document.getElementById('rang-lettre').textContent = e.rang.lettre;
  document.getElementById('xp-rempli').style.width = e.rang.progression + '%';
  document.getElementById('xp-barre').setAttribute('aria-valuenow', e.rang.progression);
  document.getElementById('xp-suivant').textContent = e.rang.suivant
    ? (e.rang.suivant.min - e.xp) + ' XP avant ' + e.rang.suivant.nom
    : 'Rang maximum atteint';

  if (rangPrecedent && rangPrecedent !== e.rang.nom) {
    var r = document.getElementById('rang');
    r.classList.remove('monte'); void r.offsetWidth; r.classList.add('monte');
  }
  rangPrecedent = e.rang.nom;

  // --- Quêtes ---
  var liste = document.getElementById('quetes');
  liste.innerHTML = '';
  var finies = 0;
  e.quetes.forEach(function (q) {
    if (q.finie) finies++;
    var li = document.createElement('li');
    li.className = 'quete' + (q.finie ? ' finie' : '');
    li.innerHTML =
      '<span class="quete-case">' + (q.finie ? iconeCoche : '') + '</span>' +
      '<div class="quete-corps"><div class="quete-titre"></div>' +
      '<div class="quete-barre"><span></span></div>' +
      '<div class="quete-compte"></div></div>' +
      '<span class="quete-xp"></span>';
    li.querySelector('.quete-titre').textContent = q.titre;
    li.querySelector('.quete-barre span').style.width = Math.round(q.fait / q.cible * 100) + '%';
    li.querySelector('.quete-compte').textContent = q.finie ? 'Terminée' : q.fait + ' / ' + q.cible;
    li.querySelector('.quete-xp').textContent = '+' + q.xp + ' XP';
    liste.appendChild(li);
  });
  document.getElementById('quetes-compte').textContent = finies + ' / ' + e.quetes.length + ' terminées';

  // --- Badges ---
  var zoneBadges = document.getElementById('badges');
  zoneBadges.innerHTML = '';
  e.badges.forEach(function (b) {
    var li = document.createElement('li');
    li.className = 'badge' + (b.obtenu ? ' obtenu' : '');
    li.innerHTML = '<span class="badge-forme">' + iconeBadge + '</span><span class="badge-nom"></span>';
    li.querySelector('.badge-nom').textContent = b.obtenu ? b.nom : '???';
    li.title = b.obtenu ? b.texte : 'Badge à débloquer';
    zoneBadges.appendChild(li);
  });
}

// --- Quartiers fermés : petite secousse + message ---
document.querySelectorAll('.quartier.ferme').forEach(function (q) {
  q.addEventListener('click', function () {
    q.classList.remove('secoue'); void q.offsetWidth; q.classList.add('secoue');
    XP.toast(q.getAttribute('data-nom') + ' ouvre en Saison ' + q.getAttribute('data-saison') + '. Reste connecté !');
  });
});

// --- Actu de la ville (démo) ---
var ACTU = [
  { pastille: 'DZ', couleur: '#C6FF3D', texte: 'La <strong>Duo Zone</strong> est ouverte : trouve un coéquipier d\'ici en quelques secondes', quand: 'Nouveau' },
  { pastille: 'AY', couleur: '#C6FF3D', texte: '<strong>Aya</strong> a remporté un défi FC contre <strong>Yann</strong>', quand: 'Il y a 12 min' },
  { pastille: 'MB', couleur: '#FFB23D', texte: '<strong>Mariam</strong> est passée au rang <strong>Pro</strong>', quand: 'Il y a 1 h' },
  { pastille: 'S2', couleur: '#FF4D8D', texte: 'Saison 2 : la <strong>guerre des communes</strong> et <strong>l\'Arène</strong> arrivent bientôt', quand: 'Annonce' },
  { pastille: 'YK', couleur: '#3DF5FF', texte: '<strong>Yann</strong> cherche un duo pour GTA ce soir', quand: 'Il y a 3 h' }
];
var fil = document.getElementById('fil');
ACTU.forEach(function (a, i) {
  var li = document.createElement('li');
  li.style.animationDelay = (0.35 + i * 0.08) + 's';
  // Ici le texte vient de NOUS (pas des membres), on peut donc utiliser du HTML.
  // Avec de vrais messages de membres, on utilisera textContent pour la sécurité.
  li.innerHTML =
    '<span class="fil-pastille" aria-hidden="true">' + a.pastille + '</span>' +
    '<div class="fil-texte">' + a.texte + '<span class="fil-quand">' + a.quand + '</span></div>';
  li.querySelector('.fil-pastille').style.background = a.couleur;
  fil.appendChild(li);
});

document.addEventListener('xp-change', afficher);
afficher();
