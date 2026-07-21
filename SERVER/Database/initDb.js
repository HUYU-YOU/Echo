// SERVER/Database/initDb.js
const pool = require('./db');

async function createTables() {
    const queryText = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(queryText);
        console.log("🟢 [INIT] Table 'users' vérifiée/créée avec succès !");
    } catch (error) {
        console.error("🔴 [INIT] Erreur lors de la création des tables :", error);
    } finally {
        process.exit(); // Coupe le script une fois terminé
    }
}

createTables();
