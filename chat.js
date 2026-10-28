/* =========================================================
   Page de chat (version de démonstration)
   - conversation avec le dernier match
   - carte de défi : Accepter / Autre heure
   - quand tu écris, le joueur « répond » (réponses simulées)
   À l'étape 4, les messages passeront par Supabase en temps réel.
   ========================================================= */

var idMatch = Stockage.lireCle('treiize-dernier-match') || 'aya';
var joueur = JOUEURS_DEMO.filter(function (j) { return j.id === idMatch; })[0] || JOUEURS_DEMO[0];

// Arrivée depuis la Duo Zone : chat.html?duo=Pseudo
var pseudoDuo = null;
try { pseudoDuo = new URLSearchParams(window.location.search).get('duo'); } catch (e) {}
var duo = pseudoDuo && DUOS_DEMO.filter(function (d) { return d.pseudo === pseudoDuo; })[0];
if (duo) {
  var dernierDuo = Stockage.lireCle('treiize-dernier-duo') || {};
  var jeuDuo = dernierDuo.jeu && duo.jeux.indexOf(dernierDuo.jeu) !== -1 ? dernierDuo.jeu : duo.jeux[0];
  joueur = { id: duo.pseudo, nom: duo.pseudo, initiales: duo.ini, couleur: duo.couleur,
             main: NOMS_JEUX[jeuDuo], jeux: [jeuDuo] };
}
var fil = document.getElementById('fil');

// En-tête
document.getElementById('nom').textContent = joueur.nom;
document.getElementById('statut').textContent = 'En ligne · joue à ' + joueur.main;
var avatar = document.getElementById('avatar');
avatar.textContent = joueur.initiales;
avatar.style.background = joueur.couleur;
document.getElementById('message').placeholder = 'Écris à ' + joueur.nom + '…';

// Le défi porte sur un jeu que vous avez en commun (sinon son jeu préféré)
var moi = Stockage.lire() || { jeux: [] };
var communs = joueur.jeux.filter(function (id) { return moi.jeux.indexOf(id) !== -1; });
var nomJeu = NOMS_JEUX[communs[0] || joueur.jeux[0]];

function descendre() {
  fil.scrollTop = fil.scrollHeight;
}

function ajouterBulle(texte, sens) {
  var bulle = document.createElement('div');
  bulle.className = 'bulle ' + sens;
  bulle.textContent = texte; // textContent : le texte ne peut pas casser la page
  fil.appendChild(bulle);
  descendre();
}

// Affiche « … en train d'écrire » puis le message
function repondre(texte, delai, ensuite) {
  var points = document.createElement('div');
  points.className = 'ecrit';
  points.setAttribute('aria-label', joueur.nom + ' est en train d\'écrire');
  points.innerHTML = '<span></span><span></span><span></span>';
  setTimeout(function () {
    fil.appendChild(points);
    descendre();
    setTimeout(function () {
      points.remove();
      ajouterBulle(texte, 'recu');
      if (ensuite) ensuite();
    }, 1100);
  }, delai || 300);
}

// --- Carte de défi ---
var iconeEclair = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>';
var iconeCoche = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';

function ajouterDefi(sens, quand) {
  var carte = document.createElement('div');
  carte.className = 'defi ' + sens;
  carte.innerHTML =
    '<div class="defi-boite">' +
      '<div class="defi-haut">' + iconeEclair + (sens === 'recu' ? 'DÉFI REÇU' : 'DÉFI ENVOYÉ') + '</div>' +
      '<div class="defi-titre"></div>' +
      '<div class="defi-infos">' +
        '<div class="defi-info"><small>QUAND</small><b class="defi-quand"></b></div>' +
        '<div class="defi-info"><small>MODE</small><b>1 contre 1</b></div>' +
        '<div class="defi-info"><small>ENJEU</small><b>Un garba</b></div>' +
      '</div>' +
      '<div class="defi-zone"></div>' +
    '</div>';
  carte.querySelector('.defi-titre').textContent = nomJeu;
  carte.querySelector('.defi-quand').textContent = quand;
  fil.appendChild(carte);
  descendre();

  var zoneBoutons = carte.querySelector('.defi-zone');
  if (sens === 'recu') {
    montrerChoix(zoneBoutons, carte);
  } else {
    var attente = document.createElement('p');
    attente.style.cssText = 'margin:14px 0 0;font-size:13px;color:#9A9AB0';
    attente.textContent = 'En attente de la réponse de ' + joueur.nom + '…';
    zoneBoutons.appendChild(attente);
    setTimeout(function () { accepter(zoneBoutons, carte, quand); }, 2200);
  }
}

function montrerChoix(zone, carte) {
  zone.innerHTML =
    '<div class="defi-actions">' +
      '<button class="btn btn-principal" type="button" data-action="ok">ACCEPTER</button>' +
      '<button class="btn btn-secondaire" type="button" data-action="autre">Autre heure</button>' +
    '</div>';
  zone.querySelector('[data-action="ok"]').addEventListener('click', function () {
    accepter(zone, carte, carte.querySelector('.defi-quand').textContent);
    repondre('Trop bien ! Prépare-toi à perdre', 600);
  });
  zone.querySelector('[data-action="autre"]').addEventListener('click', function () {
    zone.innerHTML =
      '<div class="defi-heures">' +
        '<button type="button">22h</button><button type="button">Demain</button><button type="button">Samedi</button>' +
      '</div>';
    zone.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        carte.querySelector('.defi-quand').textContent = b.textContent;
        accepter(zone, carte, b.textContent);
        repondre(b.textContent + ' ça me va. Sois à l\'heure !', 600);
      });
    });
  });
}

function accepter(zone, carte, quand) {
  if (carte.classList.contains('recu')) { // seulement un défi reçu que TU acceptes
    XP.avancerQuete('defi');
    XP.badge('defi-accepte');
  }
  zone.innerHTML =
    '<div class="defi-ok">' +
      '<span class="confetti" style="left:20%;background:#FF4D8D"></span>' +
      '<span class="confetti" style="left:50%;background:#3DF5FF;animation-delay:.1s"></span>' +
      '<span class="confetti" style="left:78%;background:#FFB23D;animation-delay:.05s"></span>' +
      iconeCoche + '<span class="defi-ok-texte"></span>' +
    '</div>';
  zone.querySelector('.defi-ok-texte').textContent = 'DÉFI ACCEPTÉ · ' + quand.toUpperCase();
  descendre();
}

// --- Réponses simulées quand tu écris ---
var reponses = [
  'Haha je vois le genre',
  'Tu joues depuis combien de temps ?',
  'Ok mais d\'abord on règle ça manette en main',
  'J\'avoue t\'es drôle toi'
];
var numeroReponse = 0;

document.getElementById('saisie').addEventListener('submit', function (e) {
  e.preventDefault();
  var champ = document.getElementById('message');
  var texte = champ.value.trim();
  if (!texte) return;
  ajouterBulle(texte, 'envoye');
  XP.avancerQuete('message');
  champ.value = '';
  repondre(reponses[numeroReponse % reponses.length], 500);
  numeroReponse += 1;
});

document.getElementById('btn-nouveau-defi').addEventListener('click', function () {
  ajouterDefi('envoye', 'Ce soir 22h');
});

// --- Fenêtre « signaler / bloquer » ---
var fenetre = document.getElementById('fenetre-signaler');
document.getElementById('btn-signaler').addEventListener('click', function () {
  fenetre.hidden = false;
  fenetre.querySelector('button').focus();
});
fenetre.querySelectorAll('[data-fermer]').forEach(function (b) {
  b.addEventListener('click', function () { fenetre.hidden = true; });
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') fenetre.hidden = true;
});

// --- Début de la conversation ---
setTimeout(function () { ajouterBulle('Salut ! J\'ai vu que t\'es sur ' + nomJeu + ' toi aussi', 'recu'); }, 200);
setTimeout(function () { ajouterBulle('Ouais ! Tu joues souvent ?', 'envoye'); }, 700);
repondre('Tous les soirs. Je te lance un défi, on verra si t\'es aussi fort que ton profil le dit', 1000, function () {
  setTimeout(function () { ajouterDefi('recu', 'Ce soir 21h'); }, 300);
});
