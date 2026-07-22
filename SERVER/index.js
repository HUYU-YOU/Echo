const WebSocket = require('ws');

// Configuration stricte sur le port 8080
const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });

console.log(`\n===========================================`);
console.log(`🚀 Serveur Echo T-RPG en ligne sur le port ${PORT}`);
console.log(`🛡️  En attente de connexions (Serveur Autoritaire)`);
console.log(`===========================================\n`);

wss.on('connection', (ws) => {
    console.log('🟢 [RÉSEAU] Un nouveau client s\'est connecté.');

    ws.on('message', (message) => {
        try {
            const rawData = message.toString();
            console.log(`\n📩 [PAQUET REÇU] : ${rawData}`);
            
            const packet = JSON.parse(rawData);
            
            // --- CANAL D'INSCRIPTION ---
            if (packet.action === 'register') {
                console.log(`👤 Tentative d'inscription : ${packet.username}`);
                console.log(`📧 E-mail : ${packet.email} | 📅 Date de naissance : ${packet.dob}`);
                
                // Le paquet de réponse attendu par ton client.js
                const response = {
                    action: "register_response",
                    success: true,
                    message: `Bienvenue ${packet.username}, inscription validée sur le port 8080 !`
                };
                
                ws.send(JSON.stringify(response));
                console.log(`📤 [RÉPONSE] Succès envoyé au client.`);
            }
            
            // --- CANAL DE CONNEXION ---
            else if (packet.action === 'login') {
                console.log(`🔑 Tentative de connexion : ${packet.username}`);
                // Simulation pour le moment
                ws.send(JSON.stringify({
                    action: "login_response",
                    success: true,
                    message: "Connexion réussie !"
                }));
            }

        } catch (error) {
            console.log(`🔴 [ERREUR] Paquet malformé ou illisible.`);
        }
    });

    ws.on('close', () => {
        console.log('🔴 [RÉSEAU] Un client s\'est déconnecté.');
    });
});
