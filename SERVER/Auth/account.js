// SERVER/Auth/account.js
const bcrypt = require('bcrypt');
const pool = require('../Database/db');

const saltRounds = 10;

async function handleRegister(ws, username, password) {
    try {
        console.log(`[AUTH] Tentative de création de compte pour : ${username}...`);

        // 1. Vérification : Le joueur existe-t-il déjà ?
        const userCheck = await pool.query('SELECT username FROM users WHERE username = $1', [username]);
        
        if (userCheck.rows.length > 0) {
            console.log(`[AUTH] ⚠️ Pseudo déjà pris : ${username}`);
            return ws.send(JSON.stringify({ status: "error", message: "Ce nom d'utilisateur est déjà pris." }));
        }

        // 2. Sécurité : Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 3. Serveur Autoritaire : Insertion dans PostgreSQL
        await pool.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
            [username, hashedPassword]
        );

        // 4. Succès ! On prévient le client
        console.log(`[AUTH] 🟢 Nouveau compte créé : ${username}`);
        ws.send(JSON.stringify({ status: "success", message: "Compte créé avec succès ! Tu peux te connecter." }));

    } catch (error) {
        console.error("[AUTH] 🔴 Erreur BDD :", error.message);
        ws.send(JSON.stringify({ status: "error", message: "Erreur interne du serveur lors de l'inscription." }));
    }
}

module.exports = { handleRegister };
