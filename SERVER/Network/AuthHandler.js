const bcrypt = require('bcrypt');
const db = require('../Database/db');

class AuthHandler {
    static async handleRegister(ws, data) {
        const { username, password } = data;

        // Validation des inputs
        if (!username || !password || password.length < 4) {
            return ws.send(JSON.stringify({
                action: "register_response",
                status: "error",
                message: "Identifiants invalides (4 caractères minimum)."
            }));
        }

        try {
            // 1. Vérification si le joueur existe (Requête préparée anti SQL-injection)
            const checkQuery = 'SELECT id FROM Users WHERE username = $1';
            const existingUser = await db.query(checkQuery, [username]);
            
            if (existingUser.rows.length > 0) {
                return ws.send(JSON.stringify({
                    action: "register_response",
                    status: "error",
                    message: "Ce pseudo est déjà utilisé."
                }));
            }

            // 2. Hachage du mot de passe
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // 3. Insertion en BDD
            const insertQuery = 'INSERT INTO Users (username, password_hash) VALUES ($1, $2) RETURNING id, username';
            const newUser = await db.query(insertQuery, [username, hashedPassword]);

            console.log(`[BDD] Utilisateur créé : ${newUser.rows[0].username} (ID: ${newUser.rows[0].id})`);

            // 4. Confirmation envoyée au client
            ws.send(JSON.stringify({
                action: "register_response",
                status: "success",
                message: "Compte créé avec succès !"
            }));

        } catch (error) {
            console.error("[Erreur Auth]", error);
            ws.send(JSON.stringify({
                action: "register_response",
                status: "error",
                message: "Erreur serveur lors de la création du compte."
            }));
        }
    }
}

module.exports = AuthHandler;
