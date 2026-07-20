// SERVER/Network/AuthHandler.js
const bcrypt = require('bcrypt');
const db = require('../Database/db'); // Importation de notre module BDD

class AuthHandler {
    static async handleRegister(ws, data) {
        const { username, password } = data;

        // 1. Validation basique
        if (!username || !password || password.length < 4) {
            return ws.send(JSON.stringify({
                action: "register_response",
                status: "error",
                message: "Identifiants invalides ou mot de passe trop court."
            }));
        }

        try {
            // 2. Vérification si le joueur existe déjà
            // Sécurité : Utilisation de $1 pour parer les injections SQL
            const checkUserQuery = 'SELECT id FROM Users WHERE username = $1';
            const userCheck = await db.query(checkUserQuery, [username]);
            
            if (userCheck.rows.length > 0) {
                return ws.send(JSON.stringify({
                    action: "register_response",
                    status: "error",
                    message: "Ce pseudo est déjà pris."
                }));
            }

            // 3. Sécurité : Hachage du mot de passe (Salt rounds = 10)
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // 4. Insertion sécurisée en Base de données
            // Le RETURNING id permet de récupérer l'ID auto-incrémenté créé par PostgreSQL
            const insertQuery = 'INSERT INTO Users (username, password_hash) VALUES ($1, $2) RETURNING id, username';
            const newUser = await db.query(insertQuery, [username, hashedPassword]);

            console.log(`Nouveau joueur enregistré en BDD : ${newUser.rows[0].username} (ID: ${newUser.rows[0].id})`);

            // 5. Réponse au client
            ws.send(JSON.stringify({
                action: "register_response",
                status: "success",
                message: "Compte créé avec succès ! Vous pouvez maintenant vous connecter."
            }));

        } catch (error) {
            console.error("Erreur BDD lors de la création du compte :", error);
            ws.send(JSON.stringify({
                action: "register_response",
                status: "error",
                message: "Erreur interne du serveur lors de l'inscription."
            }));
        }
    }
}

module.exports = AuthHandler;
