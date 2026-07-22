// SERVER/server.js
const WebSocket = require('ws');

// ON FORCE LE PORT 8080
const port = 8080;
const wss = new WebSocket.Server({ port: port });

console.log(`\n===========================================`);
console.log(`🚀 Serveur Echo T-RPG en ligne sur le port ${port}`);
console.log(`🛡️  En attente de connexions...`);
console.log(`===========================================\n`);

wss.on('connection', (ws) => {
    console.log('🟢 [RÉSEAU] Un nouveau client s\'est connecté.');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(`\n📩 [PAQUET REÇU] Action : ${data.action}`);
            
            if (data.action === 'register') {
                console.log(`👤 Inscription : ${data.username} | 📧 ${data.email}`);
                ws.send(JSON.stringify({
                    status: 'success',
                    message: `Bienvenue ${data.username}, tu as enfin vaincu le port 8080 !`
                }));
            }
        } catch (error) {
            console.log(`🔴 [ERREUR] Paquet malformé.`);
        }
    });

    ws.on('close', () => {
        console.log('🔴 [RÉSEAU] Un client s\'est déconnecté.');
    });
});
