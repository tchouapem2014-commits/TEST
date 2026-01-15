# Ralph Wiggum - Guide Complet

> Technique de developpement IA autonome pour Claude Code

## 1. Introduction

**Ralph Wiggum** est une technique de developpement IA creee par **Geoffrey Huntley** fin 2025. Elle permet de faire tourner Claude Code (ou autre CLI IA) en boucle autonome jusqu'a completion d'une tache.

Le nom vient du personnage des Simpsons, incarnant la philosophie de "persistence naive" - continuer malgre les echecs jusqu'a trouver une solution.

---

## 2. Principe de Fonctionnement

### 2.1 Concept de Base

Ralph est essentiellement une **boucle Bash infinie** qui:
1. Execute Claude Code avec un prompt
2. Capture la sortie (succes, erreurs, stack traces)
3. Renvoie cette sortie comme entree pour l'iteration suivante
4. Repete jusqu'a completion ou interruption manuelle

### 2.2 La "Naive Persistence"

La puissance de Ralph vient de sa **persistence naive**:
- L'IA n'est pas protegee de ses propres erreurs
- Les echecs sont renvoyes directement en entree
- L'IA doit confronter et corriger ses propres erreurs
- "Pression contextuelle" qui force l'IA a trouver une solution

> "Si tu presses le modele assez fort contre ses propres echecs sans filet de securite, il finira par 'rever' une solution correcte juste pour echapper a la boucle."

---

## 3. Installation

### 3.1 Plugin Officiel Anthropic

Le plugin officiel est disponible dans le repo Claude Code:

```bash
# Cloner le repo Claude Code
git clone https://github.com/anthropics/claude-code.git

# Le plugin est dans:
# claude-code/plugins/ralph-wiggum/
```

### 3.2 Implementation Manuelle (Bash)

Version minimaliste:

```bash
#!/bin/bash
# ralph.sh - Implementation basique de Ralph Wiggum

PROMPT_FILE="prompt.md"
OUTPUT_FILE="output.log"

while true; do
    echo "=== Ralph iteration $(date) ===" >> $OUTPUT_FILE

    # Executer Claude Code avec le prompt
    claude-code --prompt-file $PROMPT_FILE 2>&1 | tee -a $OUTPUT_FILE

    # Optionnel: delai entre iterations
    sleep 5
done
```

### 3.3 Ralph Orchestrator (Version Avancee)

Pour une orchestration plus sophistiquee:

```bash
git clone https://github.com/mikeyobrien/ralph-orchestrator.git
cd ralph-orchestrator
npm install
```

---

## 4. Configuration

### 4.1 Structure du Projet

```
mon-projet/
├── prompt.md           # Instructions pour Ralph
├── ralph.sh            # Script de boucle
├── .claude/            # Config Claude Code
│   └── settings.json
├── output/             # Logs et resultats
│   └── session.log
└── src/                # Code source du projet
```

### 4.2 Fichier prompt.md

Le prompt est le coeur de Ralph. Il doit definir:
- La tache a accomplir
- Les criteres de completion
- Les contraintes et regles

**Exemple:**

```markdown
# Tache: Migration React v16 vers v19

## Objectif
Migrer l'application de React 16 vers React 19.

## Criteres de Completion
- [ ] Tous les packages React mis a jour
- [ ] Aucune erreur de compilation
- [ ] Tous les tests passent
- [ ] L'application demarre correctement

## Contraintes
- Ne pas modifier la logique metier
- Conserver la retrocompatibilite des APIs
- Documenter les breaking changes

## Etapes
1. Analyser les dependances actuelles
2. Mettre a jour package.json
3. Corriger les deprecations
4. Adapter les hooks si necessaire
5. Executer les tests
6. Valider le build

## A chaque iteration
- Lire les erreurs precedentes
- Corriger un probleme a la fois
- Verifier avec npm run build && npm test
```

### 4.3 Configuration Claude Code

Dans `.claude/settings.json`:

```json
{
  "model": "claude-sonnet-4-20250514",
  "maxTokens": 8192,
  "temperature": 0.7,
  "permissions": {
    "allowEdit": true,
    "allowBash": true,
    "allowWrite": true
  }
}
```

---

## 5. Cas d'Usage Recommandes

### 5.1 Ideal Pour

| Cas d'Usage | Pourquoi Ca Marche |
|-------------|-------------------|
| **Migrations de framework** | Criteres de completion clairs (build + tests) |
| **Upgrades de dependances** | Mecaniques, erreurs explicites |
| **Refactoring large** | Patterns repetitifs |
| **Couverture de tests** | Objectif mesurable (%) |
| **Corrections de lint** | Erreurs bien definies |
| **Projets greenfield** | Partir de zero avec specs claires |

### 5.2 A Eviter

| Cas d'Usage | Pourquoi Ca Ne Marche Pas |
|-------------|--------------------------|
| **Decisions architecturales** | Pas de critere de completion objectif |
| **Design UI/UX** | Subjectif |
| **Optimisation performance** | Difficile a mesurer automatiquement |
| **Code critique securite** | Risque trop eleve |
| **Debugging complexe** | Necessite comprehension humaine |

---

## 6. Bonnes Pratiques

### 6.1 Definir des Criteres de Completion Clairs

```markdown
## Criteres de Completion (SMART)
- Specifique: npm run build retourne exit code 0
- Mesurable: npm test affiche "All tests passed"
- Atteignable: Pas de dependances externes bloquantes
- Relevant: Lie directement a l'objectif
- Temporel: Timeout apres 100 iterations
```

### 6.2 Limiter la Portee

```bash
# Bon: Tache focalisee
"Corriger toutes les erreurs TypeScript dans src/components/"

# Mauvais: Trop large
"Ameliorer le code de l'application"
```

### 6.3 Checkpoints et Sauvegarde

```bash
#!/bin/bash
# ralph-safe.sh - Avec checkpoints

ITERATION=0
MAX_ITERATIONS=100

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ITERATION=$((ITERATION + 1))

    # Checkpoint Git tous les 10 iterations
    if [ $((ITERATION % 10)) -eq 0 ]; then
        git add -A
        git commit -m "Ralph checkpoint iteration $ITERATION"
    fi

    claude-code --prompt-file prompt.md

    # Verifier si complete
    if npm run build && npm test; then
        echo "SUCCESS: Tache complete a l'iteration $ITERATION"
        exit 0
    fi
done

echo "TIMEOUT: Max iterations atteint"
exit 1
```

### 6.4 Logging Detaille

```bash
#!/bin/bash
# ralph-logged.sh

LOG_DIR="output/$(date +%Y%m%d_%H%M%S)"
mkdir -p $LOG_DIR

while true; do
    TIMESTAMP=$(date +%H%M%S)

    claude-code --prompt-file prompt.md 2>&1 | tee "$LOG_DIR/iteration_$TIMESTAMP.log"

    # Copier l'etat du projet
    cp -r src "$LOG_DIR/src_$TIMESTAMP"
done
```

---

## 7. Exemple Concret: Migration React

### 7.1 Prompt

```markdown
# Migration React 16 → 19

## Contexte
Application e-commerce existante en React 16.14.0.
Objectif: Migrer vers React 19.

## Criteres de Succes
1. `npm install` sans erreur
2. `npm run build` sans erreur
3. `npm test` - tous les tests passent
4. `npm start` - l'application demarre

## Instructions
A chaque iteration:
1. Lire les erreurs de la derniere tentative
2. Identifier la cause racine
3. Appliquer une correction
4. Verifier avec build + test

## Etapes de Migration
1. Mettre a jour react et react-dom
2. Remplacer ReactDOM.render par createRoot
3. Corriger les warnings de deprecation
4. Adapter les event handlers si necessaire
5. Mettre a jour les tests

## Contraintes
- Un changement a la fois
- Toujours verifier avec build apres modification
- Ne pas casser les fonctionnalites existantes
```

### 7.2 Script

```bash
#!/bin/bash
# ralph-react-migration.sh

cd /path/to/my-react-app

ITERATION=0
MAX_ITERATIONS=50

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ITERATION=$((ITERATION + 1))
    echo "=== Iteration $ITERATION ==="

    # Executer Claude Code
    claude-code --prompt-file migration-prompt.md

    # Verifier completion
    if npm run build 2>&1 | grep -q "Compiled successfully"; then
        if npm test 2>&1 | grep -q "All tests passed"; then
            echo "MIGRATION COMPLETE!"
            git add -A
            git commit -m "feat: Complete React 16 to 19 migration"
            exit 0
        fi
    fi

    sleep 2
done

echo "Migration incomplete apres $MAX_ITERATIONS iterations"
exit 1
```

---

## 8. Resultats Notables

### 8.1 Le Projet "Cursed"

Geoffrey Huntley a fait tourner Ralph pendant **3 mois** avec un seul prompt:

> "Make me a programming language like Golang but with Gen Z slang keywords."

**Resultat**: Un langage de programmation fonctionnel nomme **Cursed** avec:
- Compilation LLVM vers binaires natifs
- Bibliotheque standard
- Support editeur partiel
- Mots-cles: `slay` (function), `sus` (variable), `based` (true), `cap` (false)

### 8.2 Migration React 14h

Un membre de la communaute a partage une session Ralph de **14 heures** qui a migre un codebase de React v16 vers v19 entierement sans intervention humaine.

---

## 9. Integration avec SpiraApps

### 9.1 Utilisation pour le Developpement

Ralph peut etre utilise pour developper des SpiraApps comme RTI:

```markdown
# Prompt pour SpiraApp Development

## Tache
Developper une SpiraApp "Requirement Template Injector"

## Criteres de Completion
1. manifest.yaml valide (npm run validate-manifest)
2. injector.js sans erreurs de syntaxe
3. Package .spiraapp genere avec succes
4. Documentation README.md complete

## Specs
[Coller les specs ici]

## Contraintes
- Suivre le format SpiraApp officiel
- Utiliser les APIs documentees uniquement
- Tester avec le package generator
```

### 9.2 Script pour SpiraApp

```bash
#!/bin/bash
# ralph-spiraapp.sh

SPIRAAPP_DIR="SpiraApps/RequirementTemplateInjector"
GENERATOR="../spiraapp-package-generator"

while true; do
    # Developper avec Claude
    claude-code --prompt-file spiraapp-prompt.md

    # Valider le manifest
    if node "$GENERATOR/validate.js" "$SPIRAAPP_DIR/manifest.yaml"; then
        # Generer le package
        if npm run build --prefix="$GENERATOR" -- --input="$SPIRAAPP_DIR" --output="$SPIRAAPP_DIR"; then
            echo "SpiraApp built successfully!"
            exit 0
        fi
    fi

    sleep 2
done
```

---

## 10. Ressources

### Documentation Officielle
- [GitHub - how-to-ralph-wiggum](https://github.com/ghuntley/how-to-ralph-wiggum)
- [Claude Code Plugin Ralph](https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum)

### Articles
- [VentureBeat - Ralph Wiggum biggest name in AI](https://venturebeat.com/technology/how-ralph-wiggum-went-from-the-simpsons-to-the-biggest-name-in-ai-right-now)
- [HumanLayer - Brief history of Ralph](https://www.humanlayer.dev/blog/brief-history-of-ralph)
- [BoundaryML Podcast - Ralph Wiggum Coding Agent Power Tools](https://boundaryml.com/podcast/2025-10-28-ralph-wiggum-coding-agent-power-tools)

### Outils
- [Ralph Orchestrator](https://github.com/mikeyobrien/ralph-orchestrator)
- [AI Hero - 11 Tips for AI Coding with Ralph](https://www.aihero.dev/tips-for-ai-coding-with-ralph-wiggum)

---

## 11. FAQ

### Q: Combien de temps laisser tourner Ralph?
**R:** Depend de la tache. Pour une migration simple, quelques heures. Pour un projet complexe, plusieurs jours. Definissez toujours un MAX_ITERATIONS.

### Q: Comment eviter les boucles infinies?
**R:**
1. Definir des criteres de completion clairs et verifiables
2. Mettre un timeout/max iterations
3. Detecter les patterns de repetition

### Q: Ralph peut-il remplacer un developpeur?
**R:** Non. Ralph excelle pour les taches mecaniques et repetitives. Les decisions architecturales, la creativite et la comprehension metier restent humaines.

### Q: Quel modele utiliser?
**R:** Claude Sonnet pour la plupart des taches (bon ratio cout/performance). Claude Opus pour les taches complexes necessitant plus de raisonnement.

---

*Document cree le 2026-01-14*
*Auteur: SpiraApps Developer*
