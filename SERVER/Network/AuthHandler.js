const bcrypt = require('bcrypt');

// Fausse base de données pour simuler l'instance PostgreSQL pour le moment
// En production, ce sera un pool de connexion 'pg'
const mockDatabase = []; 

class AuthHandler {
    static async handleRegister(ws, data) {
        const { username, password } = data;

        // 1. Validation basique
        if (!username || !password || password.length < 4) {
            return ws.send(JSON.stringify({
                action: "register_response",
                status: "error",
                message: "Identifiants invalides ou mot de passe trop court."
            }));
        }

        // 2. Vérification si le joueur existe déjà
        const userExists = mockDatabase.find(u => u.username === username);
        if (userExists) {
            return ws.send(JSON.stringify({
                action: "register_response",
                status: "error",
                message: "Ce pseudo est déjà pris."
            }));
        }

        try {
            // 3. Sécurité : Hachage du mot de passe (Salt rounds = 10)
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // 4. Insertion en Base de données (Simulation)
            const newUser = {
                id: mockDatabase.length + 1,
                username: username,
                password_hash: hashedPassword
            };
            mockDatabase.push(newUser);

            console.log(`Nouveau joueur enregistré : ${username} | Hash: ${hashedPassword}`);

            // 5. Réponse au client
            ws.send(JSON.stringify({
                action: "register_response",
                status: "success",
                message: "Compte créé avec succès !"
            }));

        } catch (error) {
            console.error("Erreur lors de la création du compte :", error);
            ws.send(JSON.stringify({
                action: "register_response",
                status: "error",
                message: "Erreur interne du serveur."
            }));
        }
    }
}

module.exports = AuthHandler;
