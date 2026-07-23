const logDiv = document.getElementById('log');
let isRegisterMode = false;

function toggleMode() {
    isRegisterMode = !isRegisterMode;
    const registerFields = document.getElementById('register-fields');
    const mainBtn = document.getElementById('main-btn');
    const secondaryBtn = document.getElementById('secondary-btn');
    const forgotLink = document.getElementById('forgot-link');

    if (isRegisterMode) {
        registerFields.style.display = 'block';
        mainBtn.innerText = "VALIDER L'INSCRIPTION";
        mainBtn.onclick = () => sendAction('register');
        secondaryBtn.innerText = "RETOUR À LA CONNEXION";
        forgotLink.style.display = 'none';
    } else {
        registerFields.style.display = 'none';
        mainBtn.innerText = "SE CONNECTER";
        mainBtn.onclick = () => sendAction('login');
        secondaryBtn.innerText = "CRÉER UN COMPTE";
        forgotLink.style.display = 'block';
    }
}

function appendLog(message, isError = false) {
    logDiv.innerHTML += `<div style="color: ${isError ? '#bf616a' : '#a3be8c'}">${message}</div>`;
    logDiv.scrollTop = logDiv.scrollHeight;
}

// L'URL MISE À JOUR POUR LE PORT 8080 
const serverUrl = 'wss://ubiquitous-succotash-5gp4949j4x6wc79p6-8080.app.github.dev';
const ws = new WebSocket(serverUrl);

ws.onopen = () => { appendLog("🟢 Connecté au serveur autoritaire."); };

// --- LE COEUR DU RÉSEAU CÔTÉ CLIENT ---
ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        appendLog(`📩 Rép. Serveur : ${JSON.stringify(data)}`);

        // 1. Traitement de la réponse d'inscription
        if (data.action === "register_response") {
            if (data.success === true) {
                // Succès : On prévient le joueur, on vide les champs et on retourne à l'accueil
                alert("Account created ! / Compte créé avec succès !");
                
                document.getElementById('username').value = '';
                document.getElementById('password').value = '';
                document.getElementById('email').value = '';
                document.getElementById('dob').value = '';

                // On force le retour à l'écran de connexion si on y est pas déjà
                if (isRegisterMode) {
                    toggleMode(); 
                }
            } else {
                // Échec (ex: Pseudo déjà pris, qui sera géré par PostgreSQL plus tard)
                alert("Erreur lors de l'inscription : " + data.message);
                appendLog(`🔴 Erreur Inscription : ${data.message}`, true);
            }
        }
        
        // 2. Traitement de la réponse de connexion
        else if (data.action === "login_response") {
            if (data.success === true) {
                alert("Connexion réussie ! Chargement du jeu...");
                // Plus tard, c'est ici qu'on masquera l'interface HTML pour lancer la vue Godot
            } else {
                alert("Erreur de connexion : " + data.message);
                appendLog(`🔴 Erreur Connexion : ${data.message}`, true);
            }
        }

    } catch (e) {
        appendLog(`📩 Données : ${event.data}`);
    }
};

ws.onerror = () => { appendLog("🔴 Erreur de connexion réseau.", true); };
ws.onclose = () => { appendLog("❌ Déconnecté.", true); };

function sendAction(actionType) {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (!user || !pass) {
        appendLog("⚠️ Renseignez au moins le pseudo et le mot de passe.", true);
        return;
    }

    let packet = { action: actionType, username: user, password: pass };

    if (actionType === 'register') {
        const email = document.getElementById('email').value;
        const dob = document.getElementById('dob').value;
        
        if (!email || !dob) {
            appendLog("⚠️ L'e-mail et la date de naissance sont requis pour s'inscrire.", true);
            return;
        }
        
        // Validation basique de l'âge côté client (le serveur fera aussi la sienne par sécurité)
        const ageDifMs = Date.now() - new Date(dob).getTime();
        const ageDate = new Date(ageDifMs);
        if (Math.abs(ageDate.getUTCFullYear() - 1970) < 13) {
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
