# Configuration Claude Code - Serveurs MCP

Au démarrage de chaque session, rappeler les serveurs MCP disponibles :

## 🔧 Serveurs MCP Configurés

### Bases de Données
- **SQLite** (`@pollinations/mcp-server-sqlite`)
  - Base de données : `D:/RRRR/data.db`
  - Commandes : Requêtes SQL, inspection de schémas

- **PostgreSQL** (`@tejasanik/postgres-mcp-server`)
  - Serveur : localhost:5432
  - Utilisateur : postgres
  - Base : postgres (accès à toutes les bases)
  - Commandes : Requêtes SQL, gestion de bases, analyse

### Développement & Navigation
- **Chrome DevTools** (`chrome-devtools-mcp`)
  - Commandes : Automatisation navigateur, tests, screenshots

- **Puppeteer** (`@modelcontextprotocol/server-puppeteer`)
  - Commandes : Contrôle Chrome, scraping web

- **Filesystem** (`@modelcontextprotocol/server-filesystem`)
  - Accès : `C:/Users/tchou`, `D:/RRRR`
  - Commandes : Opérations fichiers/dossiers

### Intégrations
- **GitHub** (`@modelcontextprotocol/server-github`)
  - Authentification configurée
  - Commandes : Repos, issues, PRs, commits

### Intelligence
- **Memory** (`@modelcontextprotocol/server-memory`)
  - Commandes : Graphe de connaissances persistant

- **Sequential Thinking** (`@modelcontextprotocol/server-sequential-thinking`)
  - Commandes : Résolution de problèmes complexes

## 📝 Commandes Utiles

- `/mcp` - Gérer les serveurs MCP
- Taper "mcp" pour voir les outils disponibles
- Utiliser les outils MCP directement dans les conversations

## 🔄 Statut

- Tous les serveurs sont configurés
- Redémarrer Claude Code si un serveur ne répond pas
