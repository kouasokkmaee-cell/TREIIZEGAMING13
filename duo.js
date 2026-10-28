/* =========================================================
   DUO ZONE : « Je joue maintenant »
   1. Tu choisis ton jeu, ta plateforme, ton mode, ton micro
   2. Le radar cherche des joueurs d'ici, dispos tout de suite
   3. Tu invites un joueur, il accepte
   4. Le lobby s'ouvre avec vos identifiants de jeu
   Démo : les joueurs viennent de DUOS_DEMO (js/joueurs.js).
   Avec Supabase, ce seront les vrais joueurs connectés.
   ========================================================= */

var moi = Stockage.lire();
if (!moi) window.location.replace('profil.html');
moi = moi || { pseudo: 'Joueur', jeux: [], plateforme: 'mobile' };

var JEUX_DUO = ['fortnite', 'cod', 'fc', 'efootball', 'freefire', 'gta'];
var PLATEFORMES = [
  { id: 'mobile', nom: 'Mobile' }, { id: 'playstation', nom: 'PlayStation' },
  { id: 'xbox', nom: 'Xbox' }, { id: 'pc', nom: 'PC' }
];
var MODES = [{ id: 'duo', nom: 'Duo' }, { id: 'squad', nom: 'Squad' }, { id: '1v1', nom: '1 contre 1' }];

var etat = {
  jeu: JEUX_DUO.indexOf(moi.jeux && moi.jeux[0]) !== -1 ? moi.jeux[0] : 'fortnite',
  plateforme: moi.plateforme || 'mobile',
  mode: 'duo'
};

function $(id) { return document.getElementById(id); }
function initiales(p) { return (p || '?').replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || '?'; }
function nomPlateforme(id) { return (PLATEFORMES.filter(function (p) { return p.id === id; })[0] || {}).nom || id; }

// ---------- Étapes ----------
var ETAPES = ['etape-choix', 'etape-recherche', 'etape-resultats', 'etape-lobby'];
function montrer(id) {
  ETAPES.forEach(function (e) { $(e).hidden = (e !== id); });
  window.scrollTo(0, 0);
}

// ---------- Étape 1 : les choix ----------
function bouton(classe, texte, actif, clic) {
  var b = document.createElement('button');
  b.type = 'button'; b.className = classe; b.textContent = texte;
  b.setAttribute('aria-pressed', actif ? 'true' : 'false');
  b.addEventListener('click', clic);
  return b;
}
function afficherChoix() {
  var zj = $('choix-jeu'); zj.innerHTML = '';
  JEUX_DUO.forEach(function (id) {
    zj.appendChild(bouton('tuile', NOMS_JEUX[id], etat.jeu === id, function () { etat.jeu = id; afficherChoix(); }));
  });
  var zp = $('choix-plateforme'); zp.innerHTML = '';
  PLATEFORMES.forEach(function (p) {
    zp.appendChild(bouton('pastille', p.nom, etat.plateforme === p.id, function () { etat.plateforme = p.id; afficherChoix(); }));
  });
  var zm = $('choix-mode'); zm.innerHTML = '';
  MODES.forEach(function (m) {
    zm.appendChild(bouton('pastille', m.nom, etat.mode === m.id, function () { etat.mode = m.id; afficherChoix(); }));
  });
}

// ---------- Étape 2 : la recherche ----------
var minuteurs = [];
function annulerMinuteurs() { minuteurs.forEach(clearTimeout); minuteurs = []; }

function chercher() {
  $('radar-moi').textContent = initiales(moi.pseudo);
  $('recherche-titre').textContent = 'Recherche de joueurs…';
  montrer('etape-recherche');
  var messages = [
    'Joueurs de ' + NOMS_JEUX[etat.jeu] + ' autour de toi…',
    'Qui parlent ta langue…',
    'Dispos maintenant…'
  ];
  messages.forEach(function (m, i) {
    minuteurs.push(setTimeout(function () { $('recherche-texte').textContent = m; }, 300 + i * 800));
  });
  minuteurs.push(setTimeout(afficherResultats, 2900));
}

// ---------- Étape 3 : les joueurs dispos ----------
function afficherResultats() {
  var micro = $('micro').checked;
  var liste = DUOS_DEMO.filter(function (j) { return j.jeux.indexOf(etat.jeu) !== -1; });
  // Les joueurs sur la même plateforme et avec un micro (si tu en as un) passent en premier
  liste.sort(function (a, b) {
    var sa = (a.plateformes.indexOf(etat.plateforme) !== -1 ? 2 : 0) + (micro && a.micro ? 1 : 0);
    var sb = (b.plateformes.indexOf(etat.plateforme) !== -1 ? 2 : 0) + (micro && b.micro ? 1 : 0);
    return sb - sa || a.depuis - b.depuis;
  });

  $('resultats-titre').textContent = liste.length + ' dispo' + (liste.length > 1 ? 's' : '') + ' maintenant';
  $('resultats-filtre').textContent = NOMS_JEUX[etat.jeu] + ' · ' + nomPlateforme(etat.plateforme) + ' · ' +
    MODES.filter(function (m) { return m.id === etat.mode; })[0].nom;
  $('vide').hidden = liste.length > 0;

  var zone = $('joueurs'); zone.innerHTML = '';
  liste.forEach(function (j, i) {
    var li = document.createElement('li');
    li.className = 'joueur';
    li.style.animationDelay = (i * 0.07) + 's';
    li.innerHTML =
      '<span class="j-av" aria-hidden="true"></span>' +
      '<div class="j-infos">' +
        '<div class="j-nom"><span class="j-pseudo"></span><span class="j-rang"></span></div>' +
        '<div class="j-meta"></div>' +
        '<div class="j-tags"></div>' +
      '</div>';
    var av = li.querySelector('.j-av'); av.textContent = j.ini; av.style.background = j.couleur;
    li.querySelector('.j-pseudo').textContent = j.pseudo;
    li.querySelector('.j-rang').textContent = j.rang;
    li.querySelector('.j-meta').textContent = j.commune + ' · en ligne depuis ' + j.depuis + ' min';

    var tags = li.querySelector('.j-tags');
    j.plateformes.forEach(function (p) {
      var s = document.createElement('span'); s.textContent = nomPlateforme(p);
      if (p === etat.plateforme) s.className = 'ok';
      tags.appendChild(s);
    });
    var t = document.createElement('span'); t.textContent = j.micro ? 'Micro' : 'Sans micro';
    if (j.micro && micro) t.className = 'ok';
    tags.appendChild(t);
    var st = document.createElement('span'); st.textContent = j.style; tags.appendChild(st);
    var fr = document.createElement('span'); fr.textContent = 'Français'; fr.className = 'ok'; tags.appendChild(fr);

    var b = document.createElement('button');
    b.type = 'button'; b.className = 'btn btn-principal j-btn'; b.textContent = 'INVITER';
    b.setAttribute('aria-label', 'Inviter ' + j.pseudo);
    b.addEventListener('click', function () { inviter(j, li, b); });
    li.appendChild(b);
    zone.appendChild(li);
  });
  montrer('etape-resultats');
}

// ---------- Étape 4 : invitation puis lobby ----------
function inviter(j, li, b) {
  b.disabled = true; b.textContent = 'INVITÉ…';
  li.classList.add('invite');
  minuteurs.push(setTimeout(function () {
    XP.toast(j.pseudo + ' a accepté !');
    XP.avancerQuete('duo');
    XP.badge('premier-duo');
    Stockage.ecrireCle('treiize-dernier-duo', { pseudo: j.pseudo, jeu: etat.jeu });
    minuteurs.push(setTimeout(function () { ouvrirLobby(j); }, 900));
  }, 1500));
}

function ouvrirLobby(j) {
  $('lobby-moi-av').textContent = initiales(moi.pseudo);
  $('lobby-moi-nom').textContent = moi.pseudo || 'Toi';
  $('lobby-moi-id').textContent = moi.idJeu || 'ID à ajouter dans ton profil';
  var av = $('lobby-lui-av'); av.textContent = j.ini; av.style.background = j.couleur;
  $('lobby-lui-nom').textContent = j.pseudo;
  $('lobby-lui-id').textContent = j.idJeu;
  $('lobby-jeu').textContent = NOMS_JEUX[etat.jeu] + ' · ' + nomPlateforme(etat.plateforme) + ' · ' +
    MODES.filter(function (m) { return m.id === etat.mode; })[0].nom;
  $('btn-chat').href = 'chat.html?duo=' + encodeURIComponent(j.pseudo);
  montrer('etape-lobby');
}

// ---------- Boutons ----------
$('btn-chercher').addEventListener('click', chercher);
$('btn-annuler').addEventListener('click', function () { annulerMinuteurs(); montrer('etape-choix'); });
$('btn-modifier').addEventListener('click', function () { annulerMinuteurs(); montrer('etape-choix'); });
$('btn-nouveau').addEventListener('click', function () { annulerMinuteurs(); montrer('etape-choix'); });

afficherChoix();
