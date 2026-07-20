const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Nouvel import
const db = require('../Database/db');

// Clé secrète pour signer les tokens (En production, ça ira dans process.env)
const JWT_SECRET = process.env.JWT_SECRET || "ECHO_SUPER_SECRET_KEY_TACTICAL_RPG";

class AuthHandler {
    
    // --- INSCRIPTION ---
    static async handleRegister(ws, data) {
        const { username, password } = data;

        if (!username || !password || password.length < 4) {
            return ws.send(JSON.stringify({ action: "register_response", status: "error", message: "Identifiants invalides." }));
        }

        try {
            const checkQuery = 'SELECT id FROM Users WHERE username = $1';
            const existingUser = await db.query(checkQuery, [username]);
            
            if (existingUser.rows.length > 0) {
                return ws.send(JSON.stringify({ action: "register_response", status: "error", message: "Ce pseudo est déjà utilisé." }));
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const insertQuery = 'INSERT INTO Users (username, password_hash) VALUES ($1, $2) RETURNING id, username';
            const newUser = await db.query(insertQuery, [username, hashedPassword]);

            console.log(`[BDD] Utilisateur créé : ${newUser.rows[0].username}`);

            ws.send(JSON.stringify({ action: "register_response", status: "success", message: "Compte créé avec succès !" }));

        } catch (error) {
            console.error("[Erreur Auth]", error);
            ws.send(JSON.stringify({ action: "register_response", status: "error", message: "Erreur serveur." }));
        }
    }

    // --- CONNEXION ---
    static async handleLogin(ws, data) {
        const { username, password } = data;

        if (!username || !password) {
            return ws.send(JSON.stringify({ action: "login_response", status: "error", message: "Identifiants manquants." }));
        }

        try {
            // 1. Chercher le joueur en BDD
            const query = 'SELECT id, username, password_hash FROM Users WHERE username = $1';
            const result = await db.query(query, [username]);

            // Si le joueur n'existe pas
            if (result.rows.length === 0) {
                return ws.send(JSON.stringify({ action: "login_response", status: "error", message: "Utilisateur introuvable." }));
            }

            const user = result.rows[0];

            // 2. Vérifier que le mot de passe correspond au hash en BDD
            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) {
                return ws.send(JSON.stringify({ action: "login_response", status: "error", message: "Mot de passe incorrect." }));
            }

            // 3. Générer le Token JWT (valable 24h)
            const token = jwt.sign(
                { userId: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            console.log(`[Auth] Connexion réussie pour : ${user.username}`);

            // 4. Envoyer la réussite ET le Token au client
            ws.send(JSON.stringify({
                action: "login_response",
                status: "success",
                message: "Connexion réussie !",
                token: token
            }));

        } catch (error) {
            console.error("[Erreur Login]", error);
            ws.send(JSON.stringify({ action: "login_response", status: "error", message: "Erreur serveur." }));
        }
    }
}

module.exports = AuthHandler;
