# Launcher Master (Platform Master)

Launcher Electron + React de **Platform Master** : comptes, actualités, wiki, Party-cipate,
et installation / lancement du jeu.

## Versions du jeu

La liste vient de `pm-api` (`GET /api/versions`, fichier `versions.json`). Depuis la 1.1.0 :

- **Version Rust (1.0.0 et +)** : une archive `PlatformMaster-X.Y.Z-windows.zip`
  (release GitHub de `PlatformMasterRust`) contenant `PlatformMaster.exe` + `assets/`.
  Le launcher la télécharge via pm-api, la décompresse dans `versions/<version>/` et lance
  `PlatformMaster.exe` (champ `exe` de versions.json) depuis ce dossier.
  Entrée type : `{ "version": "1.0.0", "engine": "rust", "exe": "PlatformMaster.exe", "url": ["…/PlatformMaster-1.0.0-windows.zip"] }`
- **Anciennes builds Godot** : un `.exe` (et `data.win`) téléchargés tels quels.

Les sauvegardes de la version Rust sont dans `%APPDATA%\PlatformMasterRust` : réinstaller
ou supprimer une version ne les touche pas.

## Mise à jour automatique

`electron-updater` lit `latest.yml` de la dernière release de ce dépôt au démarrage, télécharge
le nouvel installeur et redémarre. Pour publier une version :

1. changer `version` dans `package.json` ;
2. pousser sur la branche `release` → GitHub Actions construit l'installeur Windows et publie
   la release (`.github/workflows/release.yml`).

(`npm run release -- patch|minor|major` fait la même chose en local avec `GH_TOKEN` dans `.env`.)

## Développement

```bash
npm install
npm run dev
npm run build:win
```
