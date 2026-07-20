// SERVER/index.js
const WebSocket = require('ws');
// On importe notre nouveau module d'authentification
const { registerPlayer } = require('./Auth/account'); 

const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });

console.log(`[SERVEUR] Démarrage... Écoute sur le port ${PORT}`);

// Événement déclenché à chaque nouvelle connexion d'un client
wss.on('connection', function connection(ws) {
    console.log("[RÉSEAU] 🟢 Un nouveau client est connecté.");

    // Événement déclenché quand ce client envoie un message
    ws.on('message', async function incoming(message) {
        const rawData = message.toString();
        console.log(`[REÇU] : ${rawData}`);

        try {
            // On s'attend à recevoir du JSON du client (ex: Unity ou Navigateur)
            const packet = JSON.parse(rawData);

            // --- ROUTAGE DES ACTIONS ---
            
            // 1. Demande d'inscription
            if (packet.action === "register") {
                // On extrait les infos envoyées par le client
                const { username, password } = packet;

                // On appelle notre fonction sécurisée (qui hache le MDP et contacte PostgreSQL)
                const result = await registerPlayer(username, password);

                // On renvoie le résultat au client
                const response = {
                    action: "register_response",
                    success: result.success,
                    message: result.message,
                    player: result.player // Contient l'ID et le niveau, mais PAS le mot de passe
                };
                ws.send(JSON.stringify(response));
            } 
            
            // 2. Ping de test (pour vérifier la connexion)
            else if (packet.action === "ping") {
                ws.send(JSON.stringify({ action: "ping_response", status: "success" }));
            }
            
            // 3. Action inconnue
            else {
                console.log("[RÉSEAU] 🟡 Action inconnue reçue :", packet.action);
            }

        } catch (error) {
            // Sécurité : Si le client envoie n'importe quoi (pas du JSON), on ne crashe pas le serveur
            console.error("[RÉSEAU] 🔴 Erreur de lecture du paquet : Format invalide.");
        }
    });
});
