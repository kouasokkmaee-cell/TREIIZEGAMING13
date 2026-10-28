/* =========================================================
   PAGE TEASER : compte à rebours, ville qui s'allume,
   guerre des communes, réservation de pseudo et parrainage.

   ⚠️ IMPORTANT AVANT DE PARTAGER LA PAGE EN PUBLIC :
   pour l'instant, les réservations restent dans le navigateur
   de chaque visiteur. Il faut relier le formulaire à Supabase
   pour récupérer la vraie liste des inscrits.
   ========================================================= */

// ---- RÉGLAGES (à modifier) ----
var DATE_OUVERTURE = '2026-12-13T20:00:00Z'; // 13/12 à 20h, heure d'Abidjan (13 comme TREIIZE)
var ADRESSE_SITE = 'https://treiize.ci/';      // l'adresse du site une fois en ligne

var COMMUNES = [
  'Abobo', 'Adjamé', 'Attécoubé', 'Cocody', 'Koumassi', 'Marcory', 'Plateau',
  'Port-Bouët', 'Treichville', 'Yopougon', 'Bingerville', 'Anyama', 'Songon',
  'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Daloa', 'Korhogo', 'Grand-Bassam', 'Man'
];
var JEUX = ['CALL OF DUTY', 'FORTNITE', 'FIFA / EA FC', 'GTA', 'FREE FIRE', 'eFOOTBALL'];

function $(id) { return document.getElementById(id); }

// ================= Petit message flottant =================
var minuteur = null;
function toast(texte) {
  var t = $('toast');
  t.textContent = texte;
  t.classList.add('visible');
  clearTimeout(minuteur);
  minuteur = setTimeout(function () { t.classList.remove('visible'); }, 2600);
}

// ================= Parrainage : qui m'a invité ? =================
var parrain = null;
try {
  var p = new URLSearchParams(window.location.search).get('parrain');
  if (p && /^[A-Za-z0-9_-]{3,20}$/.test(p)) parrain = p; // on n'accepte qu'un pseudo propre
} catch (e) { /* vieux navigateur : pas grave */ }
if (parrain) {
  var bandeauInvite = $('invite');
  bandeauInvite.textContent = parrain + ' t\'invite à rejoindre TREIIZE CITY';
  bandeauInvite.hidden = false;
}

// ================= Compte à rebours =================
var cible = new Date(DATE_OUVERTURE).getTime();
$('compte-date').textContent = new Date(cible).toLocaleDateString('fr-FR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Abidjan'
}) + ' à 20h, heure d\'Abidjan';

function deux(n) { return (n < 10 ? '0' : '') + n; }
function majChiffre(id, valeur) {
  var el = $(id);
  if (el.textContent !== valeur) {
    el.textContent = valeur;
    el.classList.remove('tic'); void el.offsetWidth; el.classList.add('tic');
  }
}
function tic() {
  var reste = Math.max(0, cible - Date.now());
  var s = Math.floor(reste / 1000);
  majChiffre('c-j', deux(Math.floor(s / 86400)));
  majChiffre('c-h', deux(Math.floor(s % 86400 / 3600)));
  majChiffre('c-m', deux(Math.floor(s % 3600 / 60)));
  majChiffre('c-s', deux(s % 60));
  if (reste === 0) $('compte').setAttribute('aria-label', 'Les portes sont ouvertes');
}
tic();
setInterval(tic, 1000);

// ================= La ville qui s'allume =================
(function construireVille() {
  var ville = $('ville');
  var nb = Math.max(6, Math.min(16, Math.floor(window.innerWidth / 70)));
  var colonnes = window.innerWidth >= 760 ? 4 : 3;
  var fenetres = [];
  for (var i = 0; i < nb; i++) {
    var b = document.createElement('div');
    b.className = 'immeuble';
    // les immeubles du centre sont plus hauts, comme une vraie skyline
    var centre = 1 - Math.abs(i - (nb - 1) / 2) / (nb / 2);
    var hauteur = 30 + centre * 55 + Math.random() * 15;
    b.style.height = Math.min(100, hauteur) + '%';
    b.style.animationDelay = (i * 0.06) + 's';
    if (Math.random() < 0.35) {
      var a = document.createElement('span');
      a.className = 'antenne';
      b.appendChild(a);
    }
    var etages = Math.round(hauteur / 12);
    for (var f = 0; f < etages * colonnes; f++) {
      var w = document.createElement('span');
      w.className = 'fenetre-v';
      b.appendChild(w);
      fenetres.push(w);
    }
    ville.appendChild(b);
  }
  var couleurs = ['', '', '', 'r', 'c', 'o']; // surtout du vert, un peu de rose, cyan, orange
  function allumer(w) {
    w.className = 'fenetre-v on ' + couleurs[Math.floor(Math.random() * couleurs.length)];
  }
  // La ville s'allume progressivement…
  var ordre = fenetres.slice().sort(function () { return Math.random() - 0.5; });
  var nbAllumer = Math.floor(fenetres.length * 0.35);
  ordre.slice(0, nbAllumer).forEach(function (w, k) {
    setTimeout(function () { allumer(w); }, 900 + k * 18);
  });
  // …puis des fenêtres s'allument et s'éteignent en permanence
  setInterval(function () {
    var w = fenetres[Math.floor(Math.random() * fenetres.length)];
    if (w.classList.contains('on')) w.className = 'fenetre-v';
    else allumer(w);
  }, 180);
})();

// ================= Les scènes animées =================
(function scenes() {
  var liste = document.querySelectorAll('.scene');
  var points = document.querySelectorAll('#scene-dots i');
  var nom = $('scene-nom');
  var i = 0;
  // Si la personne a demandé moins d'animations, on reste sur la première scène
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  setInterval(function () {
    liste[i].classList.remove('active');
    points[i].classList.remove('on');
    i = (i + 1) % liste.length;
    liste[i].classList.add('active');
    points[i].classList.add('on');
    nom.textContent = liste[i].getAttribute('data-nom');
    nom.classList.remove('change'); void nom.offsetWidth; nom.classList.add('change');
  }, 6000);
})();

// ================= Bandeau des jeux =================
var bandeau = $('bandeau');
JEUX.concat(JEUX).forEach(function (nom, i) {
  var s = document.createElement('span');
  s.className = 'bandeau-puce';
  s.textContent = nom;
  if (i >= JEUX.length) s.setAttribute('aria-hidden', 'true');
  bandeau.appendChild(s);
});

// ================= Apparition au défilement =================
var elements = document.querySelectorAll('.revele');
if ('IntersectionObserver' in window) {
  var obs = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('vu'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  elements.forEach(function (el) { obs.observe(el); });
} else {
  elements.forEach(function (el) { el.classList.add('vu'); });
}

// ================= Guerre des communes =================
var selectCommune = $('r-commune');
COMMUNES.concat('Une autre ville').forEach(function (nom) {
  var o = document.createElement('option');
  o.value = nom; o.textContent = nom;
  selectCommune.appendChild(o);
});
selectCommune.value = 'Cocody';

var zoneCommunes = $('communes');
function afficherCommunes() {
  zoneCommunes.innerHTML = '';
  COMMUNES.forEach(function (nom) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'commune';
    b.textContent = nom;
    b.setAttribute('aria-pressed', selectCommune.value === nom && communeChoisie ? 'true' : 'false');
    b.addEventListener('click', function () {
      communeChoisie = true;
      selectCommune.value = nom;
      $('commune-choix').textContent = 'Tu défends ' + nom + ' !';
      afficherCommunes();
    });
    zoneCommunes.appendChild(b);
  });
}
var communeChoisie = false;
afficherCommunes();
selectCommune.addEventListener('change', function () {
  communeChoisie = true;
  $('commune-choix').textContent = 'Tu défends ' + selectCommune.value + ' !';
  afficherCommunes();
});

// ================= Réservation du pseudo =================
var CLE = 'treiize-reservation';

function lienDe(pseudo) {
  var base = window.location.protocol.indexOf('http') === 0
    ? window.location.origin + window.location.pathname
    : ADRESSE_SITE; // page ouverte en double-clic : on montre l'adresse future
  return base + '?parrain=' + encodeURIComponent(pseudo);
}

function montrerSucces(r) {
  $('form-reserver').hidden = true;
  $('succes').hidden = false;
  $('succes-titre').textContent = r.pseudo + ' est à toi.';
  $('succes-texte').textContent = 'Rendez-vous à l\'ouverture pour défendre ' + r.commune +
    '. Invite tes potes avec ton lien : plus vous êtes nombreux, plus ta commune part avec de l\'avance.';
  var lien = lienDe(r.pseudo);
  $('lien-parrain').textContent = lien;
  var message = 'Je viens de réserver mon pseudo sur TREIIZE CITY, la ville du gaming ivoirien. ' +
    'Viens défendre ' + r.commune + ' avec moi : ' + lien;
  $('btn-whatsapp').href = 'https://wa.me/?text=' + encodeURIComponent(message);
}

var dejaReserve = null;
try { dejaReserve = JSON.parse(localStorage.getItem(CLE)); } catch (e) {}
if (dejaReserve && dejaReserve.pseudo) montrerSucces(dejaReserve);

$('form-reserver').addEventListener('submit', function (e) {
  e.preventDefault();
  var pseudo = $('r-pseudo').value.trim();
  var ok = true;

  var pseudoValide = /^[A-Za-z0-9_-]{3,20}$/.test(pseudo);
  $('err-pseudo').hidden = pseudoValide;
  if (!pseudoValide) { ok = false; $('r-pseudo').focus(); }

  var majeur = $('r-majeur').checked;
  $('err-majeur').hidden = majeur;
  if (!majeur) ok = false;

  if (!ok) return;

  var reservation = {
    pseudo: pseudo,
    commune: selectCommune.value,
    jeu: $('r-jeu').value,
    parrain: parrain,
    date: new Date().toISOString()
  };
  // PROVISOIRE : à remplacer par un envoi vers Supabase
  try { localStorage.setItem(CLE, JSON.stringify(reservation)); } catch (err) {}

  montrerSucces(reservation);
  $('succes-titre').focus();
});

$('btn-copier').addEventListener('click', function () {
  var lien = $('lien-parrain').textContent;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(lien).then(function () { toast('Lien copié !'); });
  } else {
    // solution de secours pour les vieux navigateurs
    var zone = document.createElement('textarea');
    zone.value = lien; document.body.appendChild(zone); zone.select();
    try { document.execCommand('copy'); toast('Lien copié !'); } catch (err) { toast('Copie impossible, sélectionne le lien.'); }
    zone.remove();
  }
});
