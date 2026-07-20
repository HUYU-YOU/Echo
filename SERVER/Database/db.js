// SERVER/Database/db.js
const { Pool } = require('pg');

// Configuration du pool de connexion
// Plus tard, nous mettrons ces valeurs dans un fichier .env (Config) pour plus de sécurité
const pool = new Pool({
    user: 'postgres',          // Remplace par ton utilisateur PostgreSQL
    host: 'localhost',
    database: 'tactical_rpg',  // Le nom de la base que tu as créée
    password: 'ton_mot_de_passe_sql', // Remplace par ton mot de passe
    port: 5432,
});

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
