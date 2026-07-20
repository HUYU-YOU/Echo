const WebSocket = require('ws');

// Définition du port d'écoute
const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });

console.log(`[SERVEUR] Démarrage... Écoute des connexions sur le port ${PORT}`);

// Événement déclenché à chaque fois qu'un client se connecte
wss.on('connection', function connection(ws) {
    console.log("[RÉSEAU] 🟢 Un nouveau client vient de se connecter !");

    // Événement déclenché quand le serveur reçoit des données
    ws.on('message', function incoming(message) {
        const data = message.toString();
        console.log(`[REÇU] : ${data}`);
        
        // Le serveur répond immédiatement
        const response = {
            action: "ping_response",
            status: "success",
            message: "Le serveur autoritaire te reçoit 5/5 !"
        };
        ws.send(JSON.stringify(response));
    });

    // Événement déclenché quand le client se déconnecte
    ws.on('close', () => {
        console.log("[RÉSEAU] 🔴 Un client s'est déconnecté.");
    });
});
