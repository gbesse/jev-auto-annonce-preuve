# Importer un dossier

`examples/dossier.json` donne le contrat complet. `examples/manifest.json` sépare champs métier et fichiers. `npm run demo:import` lit réellement les pièces TXT. L’adaptateur `extractText` accepte TXT, MD et PDF contenant du texte, avec limites de 8 Mo, 100 pages et 20 000 caractères extraits. Les images et PDF scannés demandent un OCR externe ; ils ne sont pas reconnus automatiquement.

Les valeurs structurées sont normalisées par l’utilisateur ou son extracteur. Les passages sémantiques doivent apparaître littéralement dans une pièce référencée ; une citation inventée est rejetée. Montants, identifiants et dates extraits doivent encore être contrôlés contre l’original : un champ JSON ne garantit pas une extraction fidèle. Les documents et contrôles ont des identifiants uniques ; les références inconnues sont rejetées. Les chemins du manifest sont des entrées locales de confiance et sont lus uniquement par la CLI.

Chaque pièce : `{id,text,source:{uri,date,licence,kind}}`. Les unités monétaires sont des centimes entiers ; les prix unitaires `MilliCents` sont des millièmes de centime. Les dates sont des dates calendaires ISO réelles.
