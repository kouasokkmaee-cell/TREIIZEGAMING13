/* =========================================================
   LE PERSONNAGE : XP, rangs, quêtes de la semaine et badges.
   Ce fichier est partagé par toutes les pages de la ville.
   À charger APRÈS stockage.js et AVANT le script de la page.

   Utilisation dans une page :
     XP.avancerQuete('gg');        // fait avancer une quête
     XP.badge('premier-match');    // débloque un badge
     XP.ajouter(50, 'Leçon');      // donne de l'XP directement

   Pour l'instant tout est gardé dans le navigateur.
   Avec Supabase, l'XP sera enregistrée sur le compte du joueur.
   ========================================================= */

var XP = (function () {

  // ---- Les rangs (XP minimum pour les atteindre) ----
  var RANGS = [
    { nom: 'Rookie',  lettre: 'R', min: 0 },
    { nom: 'Soldat',  lettre: 'S', min: 200 },
    { nom: 'Pro',     lettre: 'P', min: 600 },
    { nom: 'Légende', lettre: 'L', min: 1500 }
  ];

  // ---- Les quêtes de la semaine (Saison 1) ----
  var QUETES = [
    { id: 'profil',  titre: 'Complète ton profil gamer', xp: 100, cible: 1 },
    { id: 'duo',     titre: 'Trouve un duo dans la Duo Zone', xp: 80, cible: 1 },
    { id: 'gg',      titre: 'Donne 3 GG dans la Love Zone', xp: 60, cible: 3 },
    { id: 'defi',    titre: 'Accepte un défi', xp: 80, cible: 1 },
    { id: 'message', titre: 'Envoie 5 messages', xp: 50, cible: 5 }
  ];

  // ---- Les badges ----
  var BADGES = {
    'bienvenue':     { nom: 'Bienvenue en ville', texte: 'Entré dans TREIIZE CITY' },
    'profil-complet':{ nom: 'Perso créé', texte: 'Profil gamer complété' },
    'premier-duo':   { nom: 'Plus jamais seul', texte: 'Premier duo trouvé' },
    'premier-match': { nom: 'Player 2 trouvé', texte: 'Premier match' },
    'defi-accepte':  { nom: 'Pas peur', texte: 'Premier défi accepté' }
  };

  var CLE = 'treiize-perso';

  // Identifiant de la semaine (le lundi), pour remettre les quêtes à zéro
  function semaine() {
    var d = new Date();
    var jour = (d.getDay() + 6) % 7; // lundi = 0
    d.setDate(d.getDate() - jour);
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function lire() {
    var p = Stockage.lireCle(CLE) || {};
    p.xp = p.xp || 0;
    p.badges = p.badges || [];
    if (!p.quetes || p.quetes.semaine !== semaine()) {
      p.quetes = { semaine: semaine(), avancement: {}, finies: [] };
    }
    return p;
  }
  function ecrire(p) { Stockage.ecrireCle(CLE, p); }

  function rang(xp) {
    var actuel = RANGS[0], suivant = null;
    for (var i = 0; i < RANGS.length; i++) {
      if (xp >= RANGS[i].min) { actuel = RANGS[i]; suivant = RANGS[i + 1] || null; }
    }
    var progression = suivant
      ? Math.round((xp - actuel.min) / (suivant.min - actuel.min) * 100)
      : 100;
    return { nom: actuel.nom, lettre: actuel.lettre, suivant: suivant, progression: progression };
  }

  // ---- Petits effets visuels ----
  function animerXP(montant) {
    var el = document.createElement('div');
    el.className = 'xp-vole';
    el.setAttribute('aria-hidden', 'true');
    el.textContent = '+' + montant + ' XP';
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 1200);
  }

  var minuteurToast = null;
  function toast(texte) {
    var el = document.getElementById('toast-global');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast-global';
      el.className = 'toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = texte;
    el.classList.add('visible');
    clearTimeout(minuteurToast);
    minuteurToast = setTimeout(function () { el.classList.remove('visible'); }, 2600);
  }

  // ---- Actions ----
  function ajouter(montant, raison) {
    var p = lire();
    var avant = rang(p.xp).nom;
    p.xp += montant;
    ecrire(p);
    animerXP(montant);
    var apres = rang(p.xp).nom;
    if (apres !== avant) {
      setTimeout(function () { toast('RANG ATTEINT : ' + apres.toUpperCase() + ' !'); }, 900);
    } else if (raison) {
      toast(raison + ' · +' + montant + ' XP');
    }
    document.dispatchEvent(new CustomEvent('xp-change'));
  }

  function avancerQuete(id) {
    var quete = QUETES.filter(function (q) { return q.id === id; })[0];
    if (!quete) return;
    var p = lire();
    if (p.quetes.finies.indexOf(id) !== -1) return; // déjà finie cette semaine
    var n = (p.quetes.avancement[id] || 0) + 1;
    p.quetes.avancement[id] = n;
    var finie = n >= quete.cible;
    if (finie) p.quetes.finies.push(id);
    ecrire(p);
    if (finie) ajouter(quete.xp, 'Quête terminée');
    else document.dispatchEvent(new CustomEvent('xp-change'));
  }

  function badge(id) {
    var p = lire();
    if (!BADGES[id] || p.badges.indexOf(id) !== -1) return false;
    p.badges.push(id);
    ecrire(p);
    setTimeout(function () { toast('Badge débloqué : ' + BADGES[id].nom); }, 1400);
    document.dispatchEvent(new CustomEvent('xp-change'));
    return true;
  }

  // Ce que les pages peuvent lire pour s'afficher
  function etat() {
    var p = lire();
    return {
      xp: p.xp,
      rang: rang(p.xp),
      quetes: QUETES.map(function (q) {
        var n = Math.min(p.quetes.avancement[q.id] || 0, q.cible);
        return { id: q.id, titre: q.titre, xp: q.xp, cible: q.cible, fait: n, finie: p.quetes.finies.indexOf(q.id) !== -1 };
      }),
      badges: Object.keys(BADGES).map(function (id) {
        return { id: id, nom: BADGES[id].nom, texte: BADGES[id].texte, obtenu: p.badges.indexOf(id) !== -1 };
      })
    };
  }

  return { ajouter: ajouter, avancerQuete: avancerQuete, badge: badge, etat: etat, toast: toast };
})();
