// SERVER/index.js
const WebSocket = require('ws');
const { registerPlayer } = require('./Auth/account'); 

const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });

console.log(`[SERVEUR] Démarrage... Écoute sur le port ${PORT}`);

wss.on('connection', function connection(ws) {
    console.log("[RÉSEAU] 🟢 Un nouveau client est connecté.");

    ws.on('message', async function incoming(message) {
        const rawData = message.toString();
        console.log(`[REÇU] : ${rawData}`);

        try {
            const packet = JSON.parse(rawData);

            if (packet.action === "register") {
                const { username, password } = packet;
                const result = await registerPlayer(username, password);

                const response = {
                    action: "register_response",
                    success: result.success,
                    message: result.message,
                    player: result.player
                };
                ws.send(JSON.stringify(response));
            } 
            else if (packet.action === "ping") {
                ws.send(JSON.stringify({ action: "ping_response", status: "success" }));
            }
            else {
                console.log("[RÉSEAU] 🟡 Action inconnue reçue :", packet.action);
            }

        } catch (error) {
            console.error("[RÉSEAU] 🔴 Erreur de lecture du paquet : Format invalide.");
        }
    });
});
