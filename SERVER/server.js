// SERVER/server.js
const WebSocket = require('ws');

// Le port doit correspondre à celui que ton client essaie de joindre (8081)
const port = 8081;
const wss = new WebSocket.Server({ port: port });

console.log(`\n===========================================`);
console.log(`🚀 Serveur Echo T-RPG en ligne sur le port ${port}`);
console.log(`🛡️  En attente de connexions (Serveur Autoritaire)`);
console.log(`===========================================\n`);

wss.on('connection', (ws) => {
    console.log('🟢 [RÉSEAU] Un nouveau client s\'est connecté.');

    // Quand le serveur reçoit un message du client
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(`\n📩 [PAQUET REÇU] Action : ${data.action}`);
            
            // --- LOGIQUE D'INSCRIPTION ---
            if (data.action === 'register') {
                console.log(`👤 Tentative d'inscription pour le joueur : ${data.username}`);
                console.log(`📧 E-mail : ${data.email} | 📅 Date de naissance : ${data.dob}`);
                
                // Pour l'instant, on simule une réussite (Plus tard, on insérera dans PostgreSQL)
                const reponse = {
                    status: 'success',
                    message: `Bienvenue ${data.username}, inscription validée par le serveur !`
                };
                
                // On renvoie la réponse au client
                ws.send(JSON.stringify(reponse));
                console.log(`📤 [RÉPONSE] Validation envoyée au client.`);
            }
            
            // --- LOGIQUE DE CONNEXION ---
            else if (data.action === 'login') {
                console.log(`🔑 Tentative de connexion pour le joueur : ${data.username}`);
                // À venir : Vérification en base de données
            }

        } catch (error) {
            console.log(`🔴 [ERREUR] Paquet malformé reçu : ${message}`);
        }
    });

    ws.on('close', () => {
        console.log('🔴 [RÉSEAU] Un client s\'est déconnecté.');
    });
});
