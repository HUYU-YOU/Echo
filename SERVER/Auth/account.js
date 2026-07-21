// SERVER/Auth/account.js
const bcrypt = require('bcrypt');
const db = require('../Database/db'); // On utilise ton beau fichier db.js

const saltRounds = 10;

const registerPlayer = async (username, plainPassword) => {
    try {
        console.log(`[AUTH] Tentative de création de compte pour : ${username}...`);

        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

        // Insertion dans la table "players"
        const queryText = `
            INSERT INTO players (username, password_hash)
            VALUES ($1, $2)
            RETURNING id, username;
        `;
        const values = [username, hashedPassword];

        const result = await db.query(queryText, values);

        console.log(`[AUTH] 🟢 Compte créé avec succès : ${username}`);
        
        return { success: true, message: "Compte créé avec succès ! Tu peux te connecter.", player: result.rows[0] };

    } catch (error) {
        console.error("[AUTH] 🔴 Erreur :", error.message);
        if (error.code === '23505') {
            return { success: false, message: "Ce pseudo est déjà pris par un autre joueur." };
        }
        return { success: false, message: "Erreur interne du serveur lors de l'inscription." };
    }
};

module.exports = { registerPlayer };
