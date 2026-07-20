-- Création de la table des Personnages
CREATE TABLE IF NOT EXISTS Characters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    server_name VARCHAR(50) NOT NULL CHECK (server_name IN ('Emeryn', 'Elysia')),
    character_name VARCHAR(50) UNIQUE NOT NULL,
    class_id INTEGER NOT NULL CHECK (class_id BETWEEN 1 AND 6),
    skin_id INTEGER NOT NULL CHECK (skin_id BETWEEN 1 AND 4),
    colors JSONB NOT NULL, -- Stockage des couleurs personnalisées au format JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
