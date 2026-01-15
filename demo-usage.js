/**
 * Exemples d'utilisation du RichText Toolbar Injector
 * Fichier de démonstration avec cas d'usage concrets
 */

// ============================================================
// EXEMPLE 1: USERSCRIPT GREASEMONKEY/TAMPERMONKEY
// ============================================================

/*
// ==UserScript==
// @name         RichText Custom Button
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Ajoute un bouton personnalisé aux éditeurs RichText
// @author       Vous
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
*/

(function() {
    'use strict';

    // Charger l'injecteur (à copier ici ou via @require)
    // @require https://votre-url.com/richtext-toolbar-injector.js

    // ============================================================
    // CAS 1: Bouton d'insertion d'emoji
    // ============================================================

    const emojiInjector = new RichTextToolbarInjector({
        buttonText: '😀',
        buttonTitle: 'Insérer un emoji',
        onClick: async (ctx) => {
            const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💯', '🚀', '💡'];

            // Créer un sélecteur d'emoji popup
            const popup = document.createElement('div');
            popup.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border: 2px solid #333;
                border-radius: 8px;
                padding: 16px;
                z-index: 999999;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 8px;
            `;

            emojis.forEach(emoji => {
                const btn = document.createElement('button');
                btn.textContent = emoji;
                btn.style.cssText = 'font-size: 24px; padding: 8px; cursor: pointer; border: none; background: #f0f0f0; border-radius: 4px;';
                btn.onclick = () => {
                    ctx.insertContent(emoji);
                    document.body.removeChild(popup);
                };
                popup.appendChild(btn);
            });

            // Bouton fermer
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '✕ Fermer';
            closeBtn.style.cssText = 'grid-column: 1 / -1; padding: 8px; margin-top: 8px; cursor: pointer;';
            closeBtn.onclick = () => document.body.removeChild(popup);
            popup.appendChild(closeBtn);

            document.body.appendChild(popup);
        }
    });

    // ============================================================
    // CAS 2: Bouton de formatage avancé (texte surligné)
    // ============================================================

    const highlightInjector = new RichTextToolbarInjector({
        buttonText: '🖍️ Surligner',
        buttonTitle: 'Surligner le texte sélectionné',
        onClick: (ctx) => {
            const selection = ctx.getSelection();
            if (selection) {
                const colors = ['yellow', 'lime', 'cyan', 'pink', 'orange'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                ctx.insertContent(`<mark style="background-color: ${color};">${selection}</mark>`);
            } else {
                alert('Veuillez sélectionner du texte à surligner');
            }
        }
    });

    // ============================================================
    // CAS 3: Bouton d'insertion de template
    // ============================================================

    const templateInjector = new RichTextToolbarInjector({
        buttonIcon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/>
        </svg>`,
        buttonTitle: 'Insérer un template',
        onClick: (ctx) => {
            const templates = {
                'Signature email': `
                    <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #ccc;">
                        <p><strong>Cordialement,</strong></p>
                        <p>Votre Nom<br>
                        Votre Titre<br>
                        <a href="mailto:email@example.com">email@example.com</a></p>
                    </div>
                `,
                'Note importante': `
                    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 10px 0;">
                        <strong>⚠️ Note importante:</strong><br>
                        Votre texte ici...
                    </div>
                `,
                'Bloc de code': `
                    <pre style="background: #f4f4f4; padding: 12px; border-radius: 4px; overflow-x: auto;"><code>// Votre code ici
console.log('Hello World');</code></pre>
                `,
                'Tableau simple': `
                    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
                        <tr><th>Colonne 1</th><th>Colonne 2</th><th>Colonne 3</th></tr>
                        <tr><td>Données 1</td><td>Données 2</td><td>Données 3</td></tr>
                        <tr><td>Données 4</td><td>Données 5</td><td>Données 6</td></tr>
                    </table>
                `
            };

            // Créer un sélecteur de template
            const popup = document.createElement('div');
            popup.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border: 2px solid #333;
                border-radius: 8px;
                padding: 20px;
                z-index: 999999;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                min-width: 300px;
            `;

            popup.innerHTML = '<h3 style="margin: 0 0 15px 0;">Choisir un template</h3>';

            Object.keys(templates).forEach(name => {
                const btn = document.createElement('button');
                btn.textContent = name;
                btn.style.cssText = `
                    display: block;
                    width: 100%;
                    padding: 10px;
                    margin: 5px 0;
                    cursor: pointer;
                    border: 1px solid #ddd;
                    background: #f9f9f9;
                    border-radius: 4px;
                    text-align: left;
                `;
                btn.onmouseenter = () => btn.style.background = '#e9e9e9';
                btn.onmouseleave = () => btn.style.background = '#f9f9f9';
                btn.onclick = () => {
                    ctx.insertContent(templates[name].trim());
                    document.body.removeChild(popup);
                };
                popup.appendChild(btn);
            });

            // Bouton fermer
            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'Annuler';
            closeBtn.style.cssText = 'width: 100%; padding: 10px; margin-top: 15px; cursor: pointer; background: #f44336; color: white; border: none; border-radius: 4px;';
            closeBtn.onclick = () => document.body.removeChild(popup);
            popup.appendChild(closeBtn);

            document.body.appendChild(popup);
        }
    });

    // ============================================================
    // CAS 4: Bouton AI / Assistant (intégration avec API externe)
    // ============================================================

    const aiInjector = new RichTextToolbarInjector({
        buttonText: '🤖 AI',
        buttonTitle: 'Améliorer le texte avec AI',
        onClick: async (ctx) => {
            const selection = ctx.getSelection();
            if (!selection) {
                alert('Veuillez sélectionner du texte à améliorer');
                return;
            }

            const actions = {
                'Corriger la grammaire': 'fix grammar and spelling',
                'Rendre plus professionnel': 'make more professional',
                'Simplifier': 'simplify and make clearer',
                'Résumer': 'summarize',
                'Traduire en anglais': 'translate to English'
            };

            const popup = document.createElement('div');
            popup.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border: 2px solid #333;
                border-radius: 8px;
                padding: 20px;
                z-index: 999999;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            `;

            popup.innerHTML = `
                <h3 style="margin: 0 0 15px 0;">🤖 Action AI</h3>
                <p style="font-size: 12px; color: #666;">Texte sélectionné: "${selection.substring(0, 50)}${selection.length > 50 ? '...' : ''}"</p>
            `;

            Object.keys(actions).forEach(name => {
                const btn = document.createElement('button');
                btn.textContent = name;
                btn.style.cssText = `
                    display: block;
                    width: 100%;
                    padding: 10px;
                    margin: 5px 0;
                    cursor: pointer;
                    border: 1px solid #ddd;
                    background: linear-gradient(to right, #667eea, #764ba2);
                    color: white;
                    border-radius: 4px;
                `;
                btn.onclick = async () => {
                    btn.textContent = 'Traitement en cours...';
                    btn.disabled = true;

                    // Simuler un appel API (remplacer par votre vraie API)
                    try {
                        // Exemple avec une vraie API:
                        // const response = await fetch('https://api.openai.com/v1/chat/completions', {
                        //     method: 'POST',
                        //     headers: {
                        //         'Content-Type': 'application/json',
                        //         'Authorization': 'Bearer YOUR_API_KEY'
                        //     },
                        //     body: JSON.stringify({
                        //         model: 'gpt-3.5-turbo',
                        //         messages: [{
                        //             role: 'user',
                        //             content: `${actions[name]}: "${selection}"`
                        //         }]
                        //     })
                        // });
                        // const data = await response.json();
                        // const improvedText = data.choices[0].message.content;

                        // Simulation
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        const improvedText = `[Version améliorée: ${name}] ${selection}`;

                        ctx.insertContent(improvedText);
                        document.body.removeChild(popup);
                    } catch (error) {
                        alert('Erreur: ' + error.message);
                        btn.textContent = name;
                        btn.disabled = false;
                    }
                };
                popup.appendChild(btn);
            });

            // Bouton fermer
            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'Annuler';
            closeBtn.style.cssText = 'width: 100%; padding: 10px; margin-top: 15px; cursor: pointer; background: #666; color: white; border: none; border-radius: 4px;';
            closeBtn.onclick = () => document.body.removeChild(popup);
            popup.appendChild(closeBtn);

            document.body.appendChild(popup);
        }
    });

    // ============================================================
    // CAS 5: Bouton de sauvegarde/historique local
    // ============================================================

    const saveInjector = new RichTextToolbarInjector({
        buttonText: '💾',
        buttonTitle: 'Sauvegarder une version locale',
        onClick: (ctx) => {
            const content = ctx.getContent();
            const timestamp = new Date().toISOString();
            const key = `richtext_backup_${Date.now()}`;

            // Sauvegarder dans localStorage
            try {
                const backups = JSON.parse(localStorage.getItem('richtext_backups') || '[]');
                backups.unshift({
                    key,
                    timestamp,
                    preview: content.substring(0, 100).replace(/<[^>]+>/g, ''),
                    content
                });

                // Garder seulement les 10 dernières sauvegardes
                if (backups.length > 10) backups.pop();

                localStorage.setItem('richtext_backups', JSON.stringify(backups));

                // Notification
                const notification = document.createElement('div');
                notification.textContent = '✓ Version sauvegardée!';
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #4caf50;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 4px;
                    z-index: 999999;
                    animation: fadeOut 2s forwards;
                `;
                document.body.appendChild(notification);
                setTimeout(() => notification.remove(), 2000);
            } catch (e) {
                alert('Erreur de sauvegarde: ' + e.message);
            }
        }
    });

    // ============================================================
    // CAS 6: Bouton compteur de mots/caractères
    // ============================================================

    const statsInjector = new RichTextToolbarInjector({
        buttonText: '📊 Stats',
        buttonTitle: 'Statistiques du document',
        onClick: (ctx) => {
            const content = ctx.getContent();
            const textOnly = content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');

            const stats = {
                'Caractères (avec espaces)': textOnly.length,
                'Caractères (sans espaces)': textOnly.replace(/\s/g, '').length,
                'Mots': textOnly.trim().split(/\s+/).filter(w => w.length > 0).length,
                'Phrases': (textOnly.match(/[.!?]+/g) || []).length,
                'Paragraphes': (content.match(/<p[^>]*>/gi) || []).length || 1,
                'Temps de lecture': Math.ceil(textOnly.split(/\s+/).length / 200) + ' min'
            };

            const popup = document.createElement('div');
            popup.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border: 2px solid #333;
                border-radius: 8px;
                padding: 20px;
                z-index: 999999;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                min-width: 250px;
            `;

            popup.innerHTML = '<h3 style="margin: 0 0 15px 0;">📊 Statistiques</h3>';

            Object.entries(stats).forEach(([label, value]) => {
                popup.innerHTML += `
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                        <span>${label}:</span>
                        <strong>${value}</strong>
                    </div>
                `;
            });

            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'Fermer';
            closeBtn.style.cssText = 'width: 100%; padding: 10px; margin-top: 15px; cursor: pointer;';
            closeBtn.onclick = () => document.body.removeChild(popup);
            popup.appendChild(closeBtn);

            document.body.appendChild(popup);
        }
    });

})();

// ============================================================
// EXEMPLE D'EXTENSION CHROME
// ============================================================

/*
// manifest.json
{
    "manifest_version": 3,
    "name": "RichText Button Injector",
    "version": "1.0",
    "description": "Ajoute des boutons personnalisés aux éditeurs RichText",
    "permissions": ["activeTab", "scripting"],
    "content_scripts": [{
        "matches": ["<all_urls>"],
        "js": ["richtext-toolbar-injector.js", "content-script.js"],
        "run_at": "document_idle"
    }]
}

// content-script.js
const injector = new RichTextToolbarInjector({
    buttonText: 'Extension',
    buttonTitle: 'Mon bouton d\'extension',
    onClick: (ctx) => {
        // Communiquer avec le background script si nécessaire
        chrome.runtime.sendMessage({
            action: 'buttonClicked',
            selection: ctx.getSelection(),
            content: ctx.getContent()
        });
    }
});
*/

// ============================================================
// UTILISATION PROGRAMMATIQUE AVANCÉE
// ============================================================

/*
// Création manuelle avec contrôle total
const advancedInjector = new RichTextToolbarInjector({
    buttonText: 'Custom',
    buttonTitle: 'Bouton avancé',
    autoInject: false, // Ne pas auto-démarrer
    debug: true,

    onClick: (ctx) => {
        console.log('Context complet:', ctx);
        console.log('Type éditeur:', ctx.editorType);
        console.log('Élément éditeur:', ctx.editor);
        console.log('Toolbar:', ctx.toolbar);
        console.log('Sélection:', ctx.getSelection());

        // Manipulation avancée
        const currentContent = ctx.getContent();
        ctx.setContent(currentContent + '<p>Contenu ajouté</p>');
    }
});

// Démarrer manuellement
advancedInjector.init();

// Plus tard, forcer un rescan (après AJAX par exemple)
setTimeout(() => advancedInjector.rescan(), 5000);

// Nettoyer quand plus nécessaire
// advancedInjector.destroy();
*/
