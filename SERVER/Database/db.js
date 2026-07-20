// SERVER/Database/db.js
const { Pool } = require('pg');

// Configuration de la connexion PostgreSQL avec variables d'environnement (Sécurité !)
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'echo_rpg',
    password: process.env.DB_PASSWORD || 'ton_mot_de_passe',
    port: process.env.DB_PORT || 5432,
});

console.log("[DATABASE] Préparation du module de connexion PostgreSQL...");

// Test rapide de la connexion au démarrage
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error("[DATABASE] 🔴 Erreur de connexion à la base de données :", err.message);
    } else {
        console.log("[DATABASE] 🟢 Connecté à PostgreSQL avec succès.");
    }
});

// Fonction asynchrone pour exécuter nos requêtes SQL de manière sécurisée
const query = async (text, params) => {
    try {
        const res = await pool.query(text, params);
        return res;
    } catch (err) {
        console.error("[DATABASE] 🔴 Erreur lors de la requête :", err.message);
        throw err; // On renvoie l'erreur pour la traiter dans le serveur
    }
};

// On exporte uniquement la méthode 'query'
module.exports = {
    query,
};
