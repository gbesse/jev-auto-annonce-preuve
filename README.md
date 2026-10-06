# Auto : confronter l’annonce aux documents

**Vérifie kilométrage, propriétaires et promesses d’entretien avec leurs pièces.**

[![Tests](https://github.com/gbesse/jev-auto-annonce-preuve/actions/workflows/ci.yml/badge.svg)](https://github.com/gbesse/jev-auto-annonce-preuve/actions/workflows/ci.yml) · MIT · Node.js 22/24 · Version expérimentale

Cette voiture d’occasion tient-elle les promesses de son annonce ?

## Essayer en une minute

```sh
git clone https://github.com/gbesse/jev-auto-annonce-preuve.git
cd jev-auto-annonce-preuve
npm ci
npm run demo
npm run demo:import
npm run demo:limite
npm run demo:revue
npm run serve
```

Ouvrir http://127.0.0.1:8802 : choisir un exemple, modifier le JSON, analyser et télécharger le rapport. Aucun compte requis pour les modes hors ligne. Les exemples sont synthétiques et identifiés comme tels. [Parcours de démonstration](docs/demo/index.html).

## Ce qui est développé

Le module métier contient les contrôles propres à ce sujet. Le rapport JSON et HTML conserve chaque résultat, ses pièces et leurs empreintes SHA-256. Les passages sémantiques doivent être présents dans les pièces citées. Les nombres, dates et identifiants sont traités en code ; Jev évalue les rapprochements de sens avec abstention selon la confiance et la marge.

Le mode `regles` laisse les rapprochements sémantiques à revoir. Le mode `extraction` est une baseline lexicale simple, sans OCR ni compréhension fiable des négations. Un statut `etaye` signifie uniquement que les contrôles exécutés sont satisfaits. 

```js
import {readFile} from 'node:fs/promises';
import {analyze,toHtml} from './src/index.mjs';
const dossier=JSON.parse(await readFile('./examples/dossier.json','utf8'));
const rapport=await analyze(dossier,{mode:'regles'});
console.log(rapport.status,rapport.outputs);
const html=toHtml(rapport);
```

```sh
node bin/jev-auto-annonce-preuve.mjs examples/dossier.json --mode regles --out rapport.json --html rapport.html
```

La CLI renvoie 0 pour `etaye`, 2 pour `ecart`, 3 pour `a_revoir`, 1 pour une erreur. Les scripts de démonstration n’échouent pas lorsqu’ils montrent un dossier à revoir. Les [types du contrat métier](src/index.d.mts) et le [dossier complet](examples/dossier.json) décrivent les champs. [Importer TXT et PDF textuels](docs/imports.md).

## Appeler Jev

Créer une `.env` ignorée par Git, permissions 600, avec `TYPESAFE_API_KEY`. Les appels sont payants et transmettent les passages à `api.typesafe.ai`. Le serveur local n’autorise Jev qu’avec le démarrage explicite ci-dessous ; aucune clé n’est envoyée au navigateur.

```sh
node --env-file=.env examples/demo.mjs --live
npm run serve:live
npm run bench:live
```

Modèle fixé `jev-1.13.0`, délai d’expiration, annulation, validation des distributions et réessais bornés. Seuils initiaux configurables, non calibrés. [API TypeSafe](https://docs.typesafe.ai/api) et [limites du modèle](https://docs.typesafe.ai/model-jaggedness/jev-1.13). Le paquet est installable depuis GitHub, sans publication npm : `npm install github:gbesse/jev-auto-annonce-preuve#v0.1.0`.

## Validation et limites

```sh
npm run typecheck
npm test
npm run bench
```

Les tests locaux passent sous Node 22 et 24. Jev retrouve 4/6 statuts globaux attendus dans le test synthétique initial, avec 0 erreur(s) de fournisseur ; la couverture sémantique est de 0.0 %. Les résultats complets et leurs limites sont conservés. La CI exécute les contrôles sous Node 22 et 24. Voir [évaluation et résultats](docs/evaluation.md), [sources](docs/sources.md), [acquisition](docs/acquisition.md) et [les douze projets](docs/serie-fr.md).

HistoVec est partagé par le propriétaire. Aucun accès par plaque arbitraire. L’absence d’accident enregistré ne prouve pas l’absence de tout accident.

Version initiale : corpus synthétique, sans supériorité SOTA ni trafic démontrés. Les champs normalisés doivent être contrôlés contre les originaux. Code MIT ; exemples CC0. Projet indépendant, sans affiliation aux organismes ou à TypeSafe AI.
