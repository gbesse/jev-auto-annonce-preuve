# Évaluation reproductible

`npm run bench` compare contrôles exacts et baseline lexicale Jaccard (seuil 0,72). `npm run bench:live` ajoute Jev réel sur le même split. Les annotations ne sont jamais envoyées au fournisseur. `--dev` sélectionne le développement, le test étant le défaut. Les rapports enregistrent empreinte du corpus, prédictions, matrice de confusion, faux étayés, couverture, latence et usage. Une erreur de transport est distinguée d’une décision sémantique ; son coût peut être inconnu.

Le corpus initial est petit, synthétique et annoté par l’auteur. Les seuils Jev 0,75 de confiance et 0,20 de marge ne sont pas calibrés. Aucun résultat SOTA ou taux de réussite sur des dossiers réels n’est revendiqué. Une bonne exactitude globale peut masquer une erreur sémantique derrière un contrôle exact : lire les décisions individuelles.

Pour établir une performance utile : plusieurs centaines de cas autorisés, double annotation, séparation par organisme ou fournisseur et par famille, test figé, comparaison OCR + règles / OCR + modèle général / OCR + Jev sur les mêmes entrées. Mesurer exactitude des citations, faux étayés, abstention, temps de revue et coût. Publier les désaccords et intervalles d’incertitude.

## Mesures de la version 0.1.0

Test synthétique figé : 6 dossiers, 6 décisions sémantiques annotées. Le cas de développement est séparé par identifiant, mais les cas partagent un scénario de départ ; ils ne mesurent pas la généralisation à de nouveaux fournisseurs.

| Mode | Statuts globaux corrects | Faux étayés | Couverture sémantique | Erreurs fournisseur |
|---|---:|---:|---:|---:|
| regles | 66.7 % | 0 | 0.0 % | 0 |
| extraction | 66.7 % | 0 | 0.0 % | 0 |
| jev | 66.7 % | 0 | 0.0 % | 0 |

Le statut global inclut les contrôles exacts et l’abstention. Une forte exactitude globale peut coexister avec une faible couverture sémantique. Les décisions, distributions et usages sont dans [reports/live-test.json](../reports/live-test.json), les baselines dans [reports/offline-test.json](../reports/offline-test.json).
