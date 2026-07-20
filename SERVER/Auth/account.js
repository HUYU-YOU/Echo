// SERVER/Auth/account.js
const bcrypt = require('bcrypt');
const db = require('../Database/db'); // On importe notre connexion à la base de données

// Le "sel" (saltRounds) définit la complexité du hachage. 10 est le standard de l'industrie.
const saltRounds = 10;

// Fonction pour inscrire un nouveau joueur
const registerPlayer = async (username, plainPassword) => {
    try {
        console.log(`[AUTH] Tentative de création de compte pour : ${username}...`);

        // 1. On hache le mot de passe (on ne stocke JAMAIS en clair)
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

        // 2. On prépare la requête SQL sécurisée ($1 et $2 évitent les injections SQL)
        const queryText = `
            INSERT INTO players (username, password_hash)
            VALUES ($1, $2)
            RETURNING id, username, level;
        `;
        const values = [username, hashedPassword];

        // 3. On envoie à PostgreSQL via notre fichier db.js
        const result = await db.query(queryText, values);

        console.log(`[AUTH] 🟢 Compte créé avec succès : ${username}`);
        
        // On retourne les infos (sans le mot de passe !)
        return { success: true, player: result.rows[0] };

    } catch (error) {
        console.error("[AUTH] 🔴 Erreur :", error.message);
        
        // Gestion du cas où le joueur existe déjà (Code d'erreur PostgreSQL '23505')
        if (error.code === '23505') {
            return { success: false, message: "Ce pseudo est déjà pris par un autre joueur." };
        }
        return { success: false, message: "Erreur interne du serveur lors de l'inscription." };
    }
};

module.exports = {
    registerPlayer
};
