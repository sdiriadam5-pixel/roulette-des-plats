# La roue des saveurs

Une application web de tirage au sort pour choisir un plat parmi les 23 propositions fournies.

## Utilisation

Ouvrez simplement `index.html` dans un navigateur, ou lancez un petit serveur local :

```bash
python3 -m http.server 3000 --bind 0.0.0.0
```

Puis ouvrez `http://localhost:3000`.

## Fonctionnalités

- Roulette animée avec les 23 plats.
- Tirage aléatoire équitable (`crypto.getRandomValues` lorsqu’il est disponible).
- Bouton principal, bouton central et raccourci clavier `Espace`.
- Mode **Sans répétition** : chaque plat ne revient qu’après un tour complet.
- Réinitialisation du tour en cours.
- Historique des cinq derniers tirages affiché à l’écran.
- Sauvegarde locale des préférences et de l’historique dans le navigateur.
- Interface responsive pour mobile, tablette et ordinateur.
- Respect du réglage système de réduction des animations.

## Publier gratuitement avec GitHub Pages

1. Ouvrez `https://github.com/new` et créez un dépôt **public**, par exemple `roulette-des-saveurs`.
2. Dans le dépôt, choisissez **Add file → Upload files**.
3. Envoyez **le contenu** du dossier du projet : `index.html` doit se trouver à la racine du dépôt, avec `app.js`, `styles.css`, `manifest.webmanifest`, `sw.js`, `.nojekyll` et le dossier `icons`.
4. Validez avec **Commit changes**.
5. Ouvrez **Settings → Pages**.
6. Dans **Build and deployment**, choisissez **Deploy from a branch**, puis la branche **main** et le dossier **/(root)**. Enregistrez.
7. Après quelques instants, GitHub affiche l’adresse du site, généralement :
   `https://VOTRE-NOM.github.io/roulette-des-saveurs/`

Tous les chemins de l’application sont relatifs : elle fonctionne donc directement dans le sous-dossier GitHub Pages du dépôt.

## Installer sur iPhone

L’application est une **PWA** : elle s’installe sur l’écran d’accueil sans passer par l’App Store.

### 1. Mettre l’application en ligne

Pour être installable, elle doit être servie depuis une adresse **HTTPS**. L’ouverture directe du fichier `index.html` ou l’aperçu privé Arena ne suffit pas. GitHub Pages, décrit ci-dessus, fournit gratuitement cette adresse HTTPS.

### 2. Ajouter à l’écran d’accueil

1. Sur l’iPhone, ouvrez l’adresse HTTPS dans **Safari**.
2. Chargez une première fois l’application pour permettre la mise en cache hors ligne.
3. Touchez le bouton **Partager** (carré avec une flèche vers le haut).
4. Faites défiler puis touchez **Ajouter à l’écran d’accueil**.
5. Touchez **Ajouter**.

L’icône **Les saveurs** apparaît alors sur l’iPhone. L’application s’ouvre en plein écran et conserve l’historique sur l’appareil.

> Le mode hors ligne et l’installation nécessitent Safari et un hébergement HTTPS. Une première ouverture en ligne est indispensable.

## Fichiers

- `index.html` : structure de l’application et métadonnées iPhone.
- `styles.css` : apparence, responsive design et zones sûres iPhone.
- `app.js` : roulette, tirage, historique et sauvegarde.
- `manifest.webmanifest` : nom, icônes et mode plein écran de l’application installée.
- `sw.js` : mise en cache pour une utilisation hors ligne.
- `icons/` : icônes iPhone et PWA.

Aucune dépendance n’est nécessaire. Une connexion internet est seulement requise pour la première ouverture en ligne ; la roulette fonctionne ensuite hors ligne.
