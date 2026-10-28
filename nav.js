/* =========================================================
   Barre de navigation du bas, commune à toutes les pages.
   Pour l'utiliser dans une page :
     <nav class="nav-bas" data-page="match"></nav>
     <script src="js/nav.js"></script>
   Pour ajouter une rubrique, ajoute une ligne dans RUBRIQUES.
   ========================================================= */

(function () {
  var icone = function (chemins) {
    return '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + chemins + '</svg>';
  };

  // SAISON 1 : le Hub, la Duo Zone (le cœur de TREIIZE), la Love Zone, les messages et le profil.
  // Les autres quartiers (Académie, Arène, Quartier Pro, Marché) arrivent
  // en Saison 2 et 3 : il suffira d'ajouter leur ligne ici.
  var RUBRIQUES = [
    { id: 'hub', nom: 'Le Hub', lien: 'hub.html',
      icone: icone('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>') },
    { id: 'duo', nom: 'Duo Zone', lien: 'duo.html',
      icone: icone('<path d="M6 11h4M8 9v4"/><circle cx="15.5" cy="10.5" r=".6"/><circle cx="17.5" cy="12.5" r=".6"/><path d="M7 6h10a5 5 0 0 1 5 5v2a4 4 0 0 1-7.2 2.4L13.5 14h-3l-1.3 1.4A4 4 0 0 1 2 13v-2a5 5 0 0 1 5-5z"/>') },
    { id: 'match', nom: 'Love Zone', lien: 'match.html',
      icone: icone('<rect x="4" y="3" width="13" height="17" rx="3"/><path d="M20 7v12a2 2 0 0 1-2 2H9"/>') },
    { id: 'chat', nom: 'Messages', lien: 'chat.html',
      icone: icone('<path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.6A8 8 0 1 1 21 12z"/>') },
    { id: 'profil', nom: 'Profil', lien: 'profil.html',
      icone: icone('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>') }
  ];

  document.querySelectorAll('nav.nav-bas[data-page]').forEach(function (nav) {
    nav.setAttribute('aria-label', 'Navigation principale');
    var page = nav.getAttribute('data-page');
    nav.innerHTML = RUBRIQUES.map(function (r) {
      var actif = r.id === page ? ' aria-current="page"' : '';
      return '<a href="' + r.lien + '"' + actif + '>' + r.icone + '<span>' + r.nom + '</span></a>';
    }).join('');
  });
})();
