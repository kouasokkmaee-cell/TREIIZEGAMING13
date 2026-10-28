/* =========================================================
   Petite mémoire du site dans le navigateur (localStorage).
   C'est provisoire : à l'étape 2, le profil et les matchs
   seront enregistrés dans la base de données Supabase.
   ========================================================= */

var Stockage = {
  lireCle: function (cle) {
    try {
      var texte = window.localStorage.getItem(cle);
      return texte ? JSON.parse(texte) : null;
    } catch (e) {
      return null; // navigation privée ou stockage bloqué : on continue sans
    }
  },

  ecrireCle: function (cle, valeur) {
    try {
      window.localStorage.setItem(cle, JSON.stringify(valeur));
    } catch (e) {
      /* rien de grave, le site marche quand même */
    }
  },

  // Le profil du joueur connecté
  lire: function () { return this.lireCle('treiize-profil'); },
  ecrire: function (profil) { this.ecrireCle('treiize-profil', profil); }
};
