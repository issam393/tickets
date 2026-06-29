// Importe la connexion MySQL en mode promesse.
const db = require('../../config/db');

// Enregistre un nouveau message dans une room.
async function saveMessage(roomId, senderId, text) {
    // Insere le message avec l'id de la room, l'expediteur et le texte.
    const [insertResult] = await db.execute(
        `INSERT INTO messages (room_id, sender_id, text)
         VALUES (?, ?, ?)`,
        [roomId, senderId, text]
    );

    // Relit le message insere avec le nom de l'expediteur.
    const [rows] = await db.execute(
        `SELECT m.id, m.room_id, m.sender_id, m.text, m.createdAt,
                e.userName AS sender_name
         FROM messages m
         JOIN employees e ON e.id = m.sender_id
         WHERE m.id = ?`,
        [insertResult.insertId]
    );

    // Retourne le message complet pret a etre envoye au frontend.
    return rows[0];
}

// Recupere l'historique des messages d'une room.
async function getRoomHistory(roomId, limit = 200) {
    // Convertit la limite en nombre et garde 200 comme valeur par defaut.
    const safeLimit = Number(limit) > 0 ? Number(limit) : 200;

    // Selectionne les messages de la room avec le nom de l'expediteur.
    const [rows] = await db.execute(
        `SELECT m.id, m.room_id, m.sender_id, m.text, m.createdAt,
                e.userName AS sender_name
         FROM messages m
         JOIN employees e ON e.id = m.sender_id
         WHERE m.room_id = ?
         ORDER BY m.createdAt ASC
         LIMIT ${safeLimit}`,
        [roomId]
    );

    // Retourne les messages classes du plus ancien au plus recent.
    return rows;
}

// Exporte les fonctions d'acces aux messages.
module.exports = {
    saveMessage,
    getRoomHistory
};
