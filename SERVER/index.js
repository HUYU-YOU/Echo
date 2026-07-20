const WebSocket = require('ws');

// Définition du port (8080 est un standard pour le dev local)
const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });

console.log(`[SERVEUR] Démarrage... Écoute des connexions sur le port ${PORT}`);

// Événement déclenché à chaque fois qu'un client (Unity) se connecte
wss.on('connection', function connection(ws) {
    console.log("[RÉSEAU] 🟢 Un nouveau client vient de se connecter !");

    // Événement déclenché quand le serveur reçoit des données de ce client
    ws.on('message', function incoming(message) {
        // On convertit le message (Buffer) en texte lisible
        const data = message.toString();
        console.log(`[REÇU] : ${data}`);
        
        // Le serveur répond immédiatement pour confirmer la bonne réception
        const response = {
            action: "ping_response",
            status: "success",
            message: "Le serveur autoritaire te reçoit 5/5 !"
        };
        ws.send(JSON.stringify(response));
    });

    // Événement déclenché quand le client ferme le jeu ou perd la connexion
    ws.on('close', () => {
        console.log("[RÉSEAU] 🔴 Un client s'est déconnecté.");
    });
});
