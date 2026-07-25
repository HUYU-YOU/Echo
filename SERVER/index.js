const WebSocket = require('ws');
const { Pool } = require('pg'); // <-- AJOUT DU CONNECTEUR BASE DE DONNÉES

// --- CONFIGURATION DE LA BASE DE DONNÉES ---
const db = new Pool({
    user: 'echo_admin',
    host: 'localhost',
    database: 'echo_db',
    password: 'password123',
    port: 5432,
});

// Test de la connexion au démarrage
db.connect()
    .then(() => console.log('🐘 [DB] Base de données PostgreSQL connectée avec succès !'))
    .catch(err => console.error('🔴 [DB] Erreur de connexion à la base de données', err.stack));


// --- CONFIGURATION DU SERVEUR WEBSOCKET ---
const PORT = 8080;
// IMPORTANT : On force l'écoute sur 0.0.0.0 pour GitHub Codespaces
const wss = new WebSocket.Server({ port: PORT, host: '0.0.0.0' });

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
                
                // Simulation en attendant d'écrire la requête SQL (Prochaine étape !)
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
