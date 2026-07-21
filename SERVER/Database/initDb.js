// SERVER/Database/initDb.js
const db = require('./db');

async function createTables() {
    const queryText = `
        CREATE TABLE IF NOT EXISTS players (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await db.query(queryText);
        console.log("🟢 [INIT] Table 'players' vérifiée/créée avec succès !");
    } catch (error) {
        console.error("🔴 [INIT] Erreur lors de la création de la table :", error.message);
    } finally {
        process.exit();
    }
}

createTables();
