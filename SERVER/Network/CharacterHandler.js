const jwt = require('jsonwebtoken');
const db = require('../Database/db');

const JWT_SECRET = process.env.JWT_SECRET || "ECHO_SUPER_SECRET_KEY_TACTICAL_RPG";

class CharacterHandler {
    
    static async handleCreateCharacter(ws, packet) {
        // Le packet contient maintenant le token d'identification et les données
        const { token, data } = packet;
        const { serverName, characterName, classId, skinId, colors } = data;

        // 1. Sécurité : Vérification du Token JWT (Le joueur est-il bien connecté ?)
        if (!token) {
            return ws.send(JSON.stringify({ action: "create_character_response", status: "error", message: "Non autorisé. Jeton de session manquant." }));
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return ws.send(JSON.stringify({ action: "create_character_response", status: "error", message: "Session invalide ou expirée. Veuillez vous reconnecter." }));
        }

        const userId = decodedToken.userId;

        // 2. Validation des inputs du Game Design
        if (!serverName || !characterName || !classId || !skinId) {
            return ws.send(JSON.stringify({ action: "create_character_response", status: "error", message: "Données de personnage incomplètes." }));
        }

        if (serverName !== "Emeryn" && serverName !== "Elysia") {
            return ws.send(JSON.stringify({ action: "create_character_response", status: "error", message: "Serveur invalide." }));
        }

        try {
            // 3. Vérification de l'unicité du nom (On ne veut pas deux joueurs avec le même pseudo)
            const checkNameQuery = 'SELECT id FROM Characters WHERE character_name = $1';
            const nameCheck = await db.query(checkNameQuery, [characterName]);

            if (nameCheck.rows.length > 0) {
                return ws.send(JSON.stringify({ action: "create_character_response", status: "error", message: "Ce nom de personnage est déjà pris." }));
            }

            // 4. Insertion sécurisée en Base de données
            const insertQuery = `
                INSERT INTO Characters (user_id, server_name, character_name, class_id, skin_id, colors) 
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, character_name
            `;
            
            // On transforme l'objet des couleurs en texte JSON pour PostgreSQL
            const colorData = JSON.stringify(colors || {});
            
            const newChar = await db.query(insertQuery, [userId, serverName, characterName, classId, skinId, colorData]);

            console.log(`[Jeu] Personnage créé : ${newChar.rows[0].character_name} sur le serveur ${serverName}`);

            // 5. Réponse de succès au client
            ws.send(JSON.stringify({
                action: "create_character_response",
                status: "success",
                message: "Personnage créé avec succès !",
                data: {
                    characterName: newChar.rows[0].character_name,
                    serverName: serverName
                }
            }));

        } catch (error) {
            console.error("[Erreur Création Personnage]", error);
            ws.send(JSON.stringify({ action: "create_character_response", status: "error", message: "Erreur serveur lors de la création." }));
        }
    }
}

module.exports = CharacterHandler;
