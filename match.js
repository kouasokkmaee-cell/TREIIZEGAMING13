/* =========================================================
   Page Matchmaking
   - affiche les joueurs un par un
   - calcule un score de compatibilité (SYNC)
   - « GG » ou « Défi » déclenche l'écran « C'est un match »
   ========================================================= */

var moi = Stockage.lire() || { pseudo: 'Joueur', jeux: [], plateforme: 'mobile' };
var index = 0;
var occupe = false; // évite les doubles clics pendant une animation

var zone = document.getElementById('zone-carte');
var btnPasser = document.getElementById('btn-passer');
var btnGG = document.getElementById('btn-gg');
var btnDefi = document.getElementById('btn-defi');
var ecranMatch = document.getElementById('match-plein');

var NOMS_PLATEFORMES = { mobile: 'Mobile', playstation: 'PlayStation', xbox: 'Xbox', pc: 'PC' };

// Jeux que l'on a en commun avec ce joueur
function jeuxCommuns(joueur) {
  return joueur.jeux.filter(function (id) { return moi.jeux.indexOf(id) !== -1; });
}

// Score de compatibilité très simple : on l'améliorera plus tard
function compatibilite(joueur) {
  var score = 55 + jeuxCommuns(joueur).length * 18;
  if (NOMS_PLATEFORMES[moi.plateforme] === joueur.plateforme) score += 10;
  return Math.min(score, 99);
}

// Protège le texte avant de l'insérer dans la page
function echapper(texte) {
  var div = document.createElement('div');
  div.textContent = texte;
  return div.innerHTML;
}

function afficherCarte() {
  var joueur = JOUEURS_DEMO[index];
  var actif = !!joueur;
  btnPasser.disabled = btnGG.disabled = btnDefi.disabled = !actif;

  if (!actif) {
    zone.innerHTML =
      '<div class="fin">' +
        '<h2>NIVEAU TERMINÉ</h2>' +
        '<p>Plus de joueurs autour de toi pour l\'instant. Reviens ce soir, c\'est l\'heure de pointe.</p>' +
        '<button class="btn btn-principal" type="button" id="btn-rejouer">REJOUER</button>' +
      '</div>';
    document.getElementById('btn-rejouer').addEventListener('click', function () {
      index = 0;
      afficherCarte();
    });
    return;
  }

  var score = compatibilite(joueur);
  var circonference = 163.4;
  var trait = (score / 100 * circonference).toFixed(1) + ' ' + circonference;
  var communs = jeuxCommuns(joueur);

  var tags = joueur.jeux.map(function (id) {
    var classe = communs.indexOf(id) !== -1 ? 'tag commun' : 'tag';
    return '<span class="' + classe + '">' + echapper(NOMS_JEUX[id].toUpperCase()) + '</span>';
  }).join('') + '<span class="tag">' + echapper(joueur.style) + '</span>';

  zone.innerHTML =
    '<article class="carte" id="carte">' +
      '<div class="photo" style="background-color:' + joueur.couleur + '">' +
        '<span class="scan" aria-hidden="true"></span>' +
        '<span class="initiales" aria-hidden="true">' + echapper(joueur.initiales) + '</span>' +
        '<span class="tag-photo">PHOTO DE PROFIL</span>' +
        '<div class="sync" aria-label="Compatibilité ' + score + ' %">' +
          '<svg aria-hidden="true" width="64" height="64" viewBox="0 0 64 64">' +
            '<circle cx="32" cy="32" r="26" fill="none" stroke="#262636" stroke-width="5"/>' +
            '<circle cx="32" cy="32" r="26" fill="none" stroke="#C6FF3D" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + trait + '"/>' +
          '</svg>' +
          '<div class="sync-texte" aria-hidden="true"><div class="sync-valeur">' + score + '%</div><div class="sync-mot">SYNC</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="infos">' +
        '<div class="nom-ligne"><h1 class="nom">' + echapper(joueur.nom) + ', ' + joueur.age + '</h1><span class="ville">' + echapper(joueur.ville) + '</span></div>' +
        '<div class="main-jeu">Main : <strong>' + echapper(joueur.main) + '</strong> · ' + echapper(joueur.plateforme) + '</div>' +
        '<div class="tags">' + tags + '</div>' +
        '<p class="bio">' + echapper(joueur.bio) + '</p>' +
        '<div class="dispo">' +
          '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>' +
          echapper(joueur.dispo) +
        '</div>' +
      '</div>' +
    '</article>';
}

// Fait sortir la carte (gauche ou droite), puis lance la suite
function sortirCarte(sens, ensuite) {
  if (occupe) return;
  var carte = document.getElementById('carte');
  if (!carte) return;
  occupe = true;
  carte.classList.add(sens === 'gauche' ? 'sort-gauche' : 'sort-droite');
  setTimeout(function () {
    occupe = false;
    ensuite();
  }, 330);
}

function passer() {
  sortirCarte('gauche', function () {
    index += 1;
    afficherCarte();
  });
}

function aimer() {
  var joueur = JOUEURS_DEMO[index];
  if (!joueur) return;
  sortirCarte('droite', function () {
    // On retient ce match pour la page de chat
    Stockage.ecrireCle('treiize-dernier-match', joueur.id);
    XP.avancerQuete('gg');
    XP.badge('premier-match');
    montrerMatch(joueur);
  });
}

function montrerMatch(joueur) {
  var initialesMoi = (moi.pseudo || 'TOI').replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || 'TOI';
  document.getElementById('avatar-toi').textContent = initialesMoi;
  var lui = document.getElementById('avatar-lui');
  lui.textContent = joueur.initiales;
  lui.style.background = joueur.couleur;

  var communs = jeuxCommuns(joueur).map(function (id) { return NOMS_JEUX[id]; });
  document.getElementById('match-texte').textContent = communs.length
    ? 'Toi et ' + joueur.nom + ' jouez à ' + communs.join(' et ') + '. Lance une partie pour briser la glace.'
    : joueur.nom + ' joue surtout à ' + joueur.main + '. Lance une partie pour briser la glace.';

  ecranMatch.hidden = false;
  document.getElementById('btn-chat').focus();
}

document.getElementById('btn-continuer').addEventListener('click', function () {
  ecranMatch.hidden = true;
  index += 1;
  afficherCarte();
});

// Touche Échap pour fermer l'écran de match
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !ecranMatch.hidden) {
    document.getElementById('btn-continuer').click();
  }
});

btnPasser.addEventListener('click', passer);
btnGG.addEventListener('click', aimer);
btnDefi.addEventListener('click', aimer);

afficherCarte();
