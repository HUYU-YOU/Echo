// SERVER/Database/db.js
const { Pool } = require('pg');

// Configuration de la connexion PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'tactical_rpg',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};

// Test rapide de la connexion au démarrage
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error("Erreur de connexion à la base de données :", err.message);
    } else {
        console.log("Connecté à PostgreSQL avec succès.");
    }
});

// On exporte uniquement la méthode 'query' pour l'utiliser ailleurs
module.exports = {
    query: (text, params) => pool.query(text, params),
};
