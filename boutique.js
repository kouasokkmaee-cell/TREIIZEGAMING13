/* =========================================================
   Page Boutique : cartes cadeaux et crédits de jeu
   VERSION DÉMO : aucun vrai paiement, aucun vrai code.
   Plus tard :
   - le paiement passera par un agrégateur Mobile Money
     (ex. CinetPay) qui gère Orange, MTN, Moov et Wave ;
   - les codes viendront d'un fournisseur agréé de cartes
     cadeaux (ex. Reloadly), jamais tapés à la main.
   ========================================================= */

// ---- Réglages des prix (à ajuster selon ton fournisseur) ----
var TAUX_DOLLAR = 620;   // 1 $ en FCFA (exemple, à mettre à jour)
var MARGE = 0.08;        // ta marge : 8 %

var CATEGORIES = [
  { id: 'tout', nom: 'Tout' },
  { id: 'carte', nom: 'Cartes consoles' },
  { id: 'credit', nom: 'Crédits de jeu' }
];

var PRODUITS = [
  { id: 'psn', type: 'carte', nom: 'PlayStation Store', court: 'PlayStation', couleur: '#4D8DFF', montants: [10, 20, 50], populaire: true },
  { id: 'xbox', type: 'carte', nom: 'Xbox', court: 'Xbox', couleur: '#6BE38B', montants: [10, 25, 50] },
  { id: 'apple', type: 'carte', nom: 'App Store & iTunes', court: 'App Store', couleur: '#E4E4EE', montants: [10, 25, 50] },
  { id: 'google', type: 'carte', nom: 'Google Play', court: 'Google Play', couleur: '#3DF5FF', montants: [5, 10, 25] },
  { id: 'cod', type: 'credit', nom: 'COD Points', court: 'Call of Duty', couleur: '#FFB23D', montants: [5, 10, 20], populaire: true },
  { id: 'vbucks', type: 'credit', nom: 'V-Bucks', court: 'Fortnite', couleur: '#9B7BFF', montants: [8, 20, 35] },
  { id: 'fcpoints', type: 'credit', nom: 'FC Points', court: 'EA Sports FC', couleur: '#C6FF3D', montants: [5, 10, 20] },
  { id: 'ff', type: 'credit', nom: 'Diamants Free Fire', court: 'Free Fire', couleur: '#FF4D8D', montants: [2, 5, 10] }
];

var OPERATEURS = [
  { id: 'orange', nom: 'Orange Money', couleur: '#FF7900' },
  { id: 'mtn', nom: 'MTN MoMo', couleur: '#FFCC00' },
  { id: 'moov', nom: 'Moov Money', couleur: '#2E7CF6' },
  { id: 'wave', nom: 'Wave', couleur: '#1DC8FF' }
];

var etat = { categorie: 'tout', produit: null, montant: null, operateur: 'orange' };

// Prix en FCFA, arrondi aux 50 F supérieurs
function prixFCFA(dollars) {
  var prix = dollars * TAUX_DOLLAR * (1 + MARGE);
  return Math.ceil(prix / 50) * 50;
}
function formatFCFA(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
}

// Crée le visuel d'une carte cadeau
function visuelCarte(produit, grand) {
  var carte = document.createElement('div');
  carte.className = 'carte-cadeau';
  carte.style.backgroundColor = produit.couleur;
  carte.innerHTML =
    '<div class="cc-haut"><span class="cc-type"></span><span class="cc-puce"></span></div>' +
    '<div class="cc-nom"></div>';
  carte.querySelector('.cc-type').textContent = produit.type === 'carte' ? 'CARTE CADEAU' : 'CRÉDITS';
  carte.querySelector('.cc-nom').textContent = produit.nom;
  if (produit.populaire && grand) {
    var badge = document.createElement('span');
    badge.className = 'populaire';
    badge.textContent = 'TOP';
    carte.appendChild(badge);
  }
  return carte;
}

// ---- Onglets ----
function afficherOnglets() {
  var zone = document.getElementById('onglets');
  zone.innerHTML = '';
  CATEGORIES.forEach(function (cat) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'onglet';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', etat.categorie === cat.id ? 'true' : 'false');
    b.textContent = cat.nom;
    b.addEventListener('click', function () {
      etat.categorie = cat.id;
      afficherOnglets();
      afficherProduits();
    });
    zone.appendChild(b);
  });
}

// ---- Grille de produits ----
function afficherProduits() {
  var zone = document.getElementById('produits');
  zone.innerHTML = '';
  PRODUITS.filter(function (p) {
    return etat.categorie === 'tout' || p.type === etat.categorie;
  }).forEach(function (produit, i) {
    var bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'produit';
    bouton.style.animationDelay = (i * 0.05) + 's';
    bouton.setAttribute('aria-label', produit.nom + ', dès ' + formatFCFA(prixFCFA(produit.montants[0])));
    bouton.appendChild(visuelCarte(produit, true));

    var bas = document.createElement('div');
    bas.className = 'produit-bas';
    bas.innerHTML = '<span class="produit-nom"></span><span class="produit-prix"></span>';
    bas.querySelector('.produit-nom').textContent = produit.court;
    bas.querySelector('.produit-prix').textContent = 'dès ' + formatFCFA(prixFCFA(produit.montants[0]));
    bouton.appendChild(bas);

    bouton.addEventListener('click', function () { ouvrirAchat(produit); });
    zone.appendChild(bouton);
  });
}

// ---- Fenêtre d'achat ----
var fenetre = document.getElementById('fenetre');
var dernierBouton = null;

function montrerEtape(id) {
  ['etape-achat', 'etape-attente', 'etape-ok'].forEach(function (e) {
    document.getElementById(e).hidden = (e !== id);
  });
}

function ouvrirAchat(produit) {
  dernierBouton = document.activeElement;
  etat.produit = produit;
  etat.montant = produit.montants[1] || produit.montants[0];

  var visuel = document.getElementById('achat-visuel');
  visuel.innerHTML = '';
  visuel.style.backgroundColor = produit.couleur;
  visuel.style.backgroundImage = 'repeating-linear-gradient(135deg, rgba(11,11,18,.08) 0 6px, transparent 6px 14px)';
  document.getElementById('achat-type').textContent = produit.type === 'carte' ? 'CARTE CADEAU' : 'CRÉDITS DE JEU · ' + produit.court.toUpperCase();
  document.getElementById('achat-nom').textContent = produit.nom;
  document.getElementById('erreur-tel').hidden = true;

  afficherMontants();
  afficherOperateurs();
  montrerEtape('etape-achat');
  fenetre.hidden = false;
  document.getElementById('btn-fermer').focus();
}

function fermerAchat() {
  fenetre.hidden = true;
  if (dernierBouton) dernierBouton.focus();
}

function afficherMontants() {
  var zone = document.getElementById('montants');
  zone.innerHTML = '';
  etat.produit.montants.forEach(function (m) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'montant';
    b.setAttribute('aria-pressed', etat.montant === m ? 'true' : 'false');
    b.innerHTML = '<b></b><small></small>';
    b.querySelector('b').textContent = m + ' $';
    b.querySelector('small').textContent = formatFCFA(prixFCFA(m));
    b.addEventListener('click', function () {
      etat.montant = m;
      afficherMontants();
    });
    zone.appendChild(b);
  });
  document.getElementById('btn-payer').textContent = 'PAYER ' + formatFCFA(prixFCFA(etat.montant));
}

function afficherOperateurs() {
  var zone = document.getElementById('operateurs');
  zone.innerHTML = '';
  OPERATEURS.forEach(function (op) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'operateur';
    b.setAttribute('aria-pressed', etat.operateur === op.id ? 'true' : 'false');
    b.innerHTML = '<span class="rond-couleur" aria-hidden="true"></span><span></span>';
    b.querySelector('.rond-couleur').style.background = op.couleur;
    b.lastChild.textContent = op.nom;
    b.addEventListener('click', function () {
      etat.operateur = op.id;
      afficherOperateurs();
    });
    zone.appendChild(b);
  });
}

// Code factice pour la démo
function codeDemo() {
  var lettres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var bloc = function () {
    var s = '';
    for (var i = 0; i < 4; i++) s += lettres[Math.floor(Math.random() * lettres.length)];
    return s;
  };
  return 'DEMO-' + bloc() + '-' + bloc();
}

// Paiement (simulé)
document.getElementById('etape-achat').addEventListener('submit', function (e) {
  e.preventDefault();
  var tel = document.getElementById('tel').value.replace(/\D/g, '');
  if (tel.length !== 10) {
    document.getElementById('erreur-tel').hidden = false;
    document.getElementById('tel').focus();
    return;
  }
  document.getElementById('erreur-tel').hidden = true;

  var operateur = OPERATEURS.filter(function (o) { return o.id === etat.operateur; })[0];
  var prix = formatFCFA(prixFCFA(etat.montant));
  document.getElementById('texte-attente').textContent =
    'Une demande de ' + prix + ' a été envoyée sur ton ' + operateur.nom + '. Confirme avec ton code secret.';
  montrerEtape('etape-attente');

  // Ici, le vrai site attendra la confirmation de l'agrégateur de paiement
  setTimeout(function () {
    var code = codeDemo();
    document.getElementById('code').textContent = code;
    document.getElementById('texte-ok').textContent =
      etat.produit.nom + ' ' + etat.montant + ' $ · payé ' + prix + ' avec ' + operateur.nom + '.';
    montrerEtape('etape-ok');
    document.getElementById('btn-terminer').focus();

    // On garde l'historique d'achats dans le navigateur (démo)
    try {
      var achats = JSON.parse(localStorage.getItem('treiize-achats') || '[]');
      achats.unshift({ produit: etat.produit.nom, montant: etat.montant, prix: prixFCFA(etat.montant), date: new Date().toISOString() });
      localStorage.setItem('treiize-achats', JSON.stringify(achats.slice(0, 20)));
    } catch (err) { /* pas grave */ }
  }, 2600);
});

document.getElementById('btn-fermer').addEventListener('click', fermerAchat);
document.getElementById('btn-terminer').addEventListener('click', fermerAchat);
fenetre.addEventListener('click', function (e) {
  if (e.target === fenetre) fermerAchat();
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !fenetre.hidden) fermerAchat();
});

afficherOnglets();
afficherProduits();
