const logDiv = document.getElementById('log');

function appendLog(message, isError = false) {
    logDiv.innerHTML += `<div style="color: ${isError ? '#bf616a' : '#a3be8c'}">${message}</div>`;
    logDiv.scrollTop = logDiv.scrollHeight;
}

// Connexion au serveur autoritaire
const serverUrl = 'wss://ubiquitous-succotash-5gp4949j4x6wc79p6-8081.app.github.dev';
const ws = new WebSocket(serverUrl);

ws.onopen = () => {
    appendLog("🟢 Connecté au serveur autoritaire.");
};

ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        appendLog(`📩 Rép. Serveur : ${JSON.stringify(data)}`);
    } catch (e) {
        appendLog(`📩 Données : ${event.data}`);
    }
};

ws.onerror = () => {
    appendLog("🔴 Erreur de connexion réseau.", true);
};

ws.onclose = () => {
    appendLog("❌ Déconnecté.", true);
};

function sendAction(actionType) {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (!user || !pass) {
        appendLog("⚠️ Renseignez au moins le pseudo et le mot de passe.", true);
        return;
    }

    let packet = {
        action: actionType,
        username: user,
        password: pass
    };

    // Si c'est une création de compte, on vérifie l'âge et l'email
    if (actionType === 'register') {
        const email = document.getElementById('email').value;
        const dob = document.getElementById('dob').value;

        if (!email || !dob) {
            appendLog("⚠️ L'e-mail et la date de naissance sont requis pour s'inscrire.", true);
            return;
        }

        // Calcul de l'âge
        const ageDifMs = Date.now() - new Date(dob).getTime();
        const ageDate = new Date(ageDifMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);

        if (age < 13) {
            appendLog("🔴 Inscription refusée : Vous devez avoir au moins 13 ans.", true);
            return;
        }

        packet.email = email;
        packet.dob = dob;
    }

    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(packet));
        appendLog(`📤 Requête [${actionType}] envoyée...`);
    } else {
        appendLog("🔴 Serveur injoignable.", true);
    }
}
