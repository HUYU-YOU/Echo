const WebSocket = require('ws');
const { Pool } = require('pg');
const bcrypt = require('bcrypt'); // Importation vitale pour crypter le mot de passe

// --- CONFIGURATION DE LA BASE DE DONNÉES ---
const db = new Pool({
    user: 'echo_admin',
    host: 'localhost',
    database: 'echo_db',
    password: 'password123',
    port: 5432,
});

// Test de connexion et Création de la table 'users' si elle n'existe pas
db.connect()
    .then(async () => {
        console.log('🐘 [DB] Base de données PostgreSQL connectée avec succès !');
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                dob DATE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('📜 [DB] Table "users" vérifiée/prête !');
    })
    .catch(err => console.error('🔴 [DB] Erreur de connexion', err.stack));


// --- CONFIGURATION DU SERVEUR WEBSOCKET ---
const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT, host: '0.0.0.0' });

console.log(`\n===========================================`);
console.log(`🚀 Serveur Echo T-RPG en ligne sur le port ${PORT}`);
console.log(`🛡️  En attente de connexions (Serveur Autoritaire)`);
console.log(`===========================================\n`);

wss.on('connection', (ws) => {
    console.log('🟢 [RÉSEAU] Un nouveau client s\'est connecté.');

    // ATTENTION : On ajoute 'async' ici pour pouvoir utiliser la base de données
    ws.on('message', async (message) => {
        try {
            const rawData = message.toString();
            console.log(`\n📩 [PAQUET REÇU] : ${rawData}`);
            const packet = JSON.parse(rawData);
            
            // --- CANAL D'INSCRIPTION (LE VRAI !) ---
            if (packet.action === 'register') {
                console.log(`👤 Traitement de l'inscription pour : ${packet.username}`);
                
                try {
                    // 1. Hachage du mot de passe (on ne stocke JAMAIS en clair)
                    const hashedPassword = await bcrypt.hash(packet.password, 10);
                    
                    // 2. Insertion dans PostgreSQL (Requête paramétrée contre les injections SQL)
                    const insertQuery = `
                        INSERT INTO users (username, email, dob, password_hash)
                        VALUES ($1, $2, $3, $4) RETURNING id
                    `;
                    await db.query(insertQuery, [packet.username, packet.email, packet.dob, hashedPassword]);
                    
                    // 3. Succès !
                    ws.send(JSON.stringify({
                        action: "register_response",
                        success: true,
                        message: `Succès : Compte de ${packet.username} créé en Base de Données !`
                    }));
                    console.log(`✅ [DB] Nouveau joueur enregistré : ${packet.username}`);

                } catch (dbError) {
                    // Erreur classique : le pseudo ou l'email existe déjà (contrainte UNIQUE)
                    console.error(`🔴 [DB ERREUR] :`, dbError.detail || dbError.message);
                    ws.send(JSON.stringify({
                        action: "register_response",
                        success: false,
                        message: "Erreur : Ce pseudonyme ou cet e-mail est déjà utilisé."
                    }));
                }
            }
            
            // --- CANAL DE CONNEXION (Prochaine étape) ---
            else if (packet.action === 'login') {
                ws.send(JSON.stringify({ action: "login_response", success: true, message: "Connexion en travaux..." }));
            }

        } catch (error) {
            console.log(`🔴 [ERREUR] Paquet malformé.`);
        }
    });

    ws.on('close', () => console.log('🔴 [RÉSEAU] Un client s\'est déconnecté.'));
});
