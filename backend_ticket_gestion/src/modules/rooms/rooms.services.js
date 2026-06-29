// Importe le repository des rooms pour lire et modifier les rooms en base.
const roomRepository = require('./rooms.repository');
// Importe le repository des messages pour charger l'historique d'une room.
const messageRepository = require('../messages/messages.repository');
// Importe les fonctions qui normalisent les roles et verifient les droits d'acces.
const { canRoleAccessRoom, parseAllowedRoles } = require('../../utils/roomAccess');

// Convertit une room brute venant de MySQL en objet plus facile a utiliser.
function normalizeRoom(room) {
    // Si aucune room n'existe, on retourne null.
    if (!room) return null;

    // Copie les champs de la room et convertit allowed_services en tableau JavaScript.
    return {
        ...room,
        allowed_services: parseAllowedRoles(room.allowed_services)
    };
}

// Recupere une room par son identifiant.
async function getRoomById(roomId) {
    // Demande la room au repository.
    const room = await roomRepository.getRoomById(roomId);
    // Normalise le resultat avant de le renvoyer.
    return normalizeRoom(room);
}

// Recupere la room rattachee a un ticket.
async function getRoomByTicketId(ticketId) {
    // Demande la room au repository a partir de l'id du ticket.
    const room = await roomRepository.getRoomByTicketId(ticketId);
    // Normalise le resultat avant de le renvoyer.
    return normalizeRoom(room);
}

// Verifie si un utilisateur a le droit d'acceder a une room.
function assertRoomAccess(room, service) {
    // Bloque si la room n'existe pas.
    if (!room) {
        throw new Error('Room not found');
    }

    // Bloque la messagerie si le ticket est deja resolu.
    if (room.ticket_status === 'Resolved') {
        throw new Error('Ticket already resolved. Messages are read-only and hidden.');
    }

    // Bloque si le service de l'utilisateur n'est pas autorise pour cette room.
    if (!canRoleAccessRoom(service, room.allowed_services)) {
        throw new Error('Access denied');
    }
}

// Liste les rooms accessibles pour un role donne.
async function listRoomsForRole(service, employeeId) {
    // Recupere les rooms candidates depuis la base.
    const rooms = await roomRepository.getAccessibleRoomsByRole(employeeId);
    // Normalise, retire les tickets resolus, puis filtre selon le role.
    return rooms
        .map(normalizeRoom)
        .filter((room) => room.ticket_status !== 'Resolved')
        .filter((room) => canRoleAccessRoom(service, room.allowed_services));
}

// Marque une room comme lue pour un employe.
async function markRoomAsRead(roomId, service, employeeId) {
    // Charge la room pour verifier son existence.
    const room = await getRoomById(roomId);
    // Verifie que l'employe a le droit d'acceder a cette room.
    assertRoomAccess(room, service);
    // Enregistre l'etat lu en base.
    await roomRepository.markRoomAsRead(roomId, employeeId);
}

// Charge l'historique des messages d'une room.
async function getRoomHistory(roomId, service, employeeId) {
    // Charge la room concernee.
    const room = await getRoomById(roomId);
    // Verifie que l'utilisateur peut consulter cette room.
    assertRoomAccess(room, service);

    // Recupere les messages en base.
    const history = await messageRepository.getRoomHistory(roomId);
    // Si l'utilisateur est connu, la consultation marque la room comme lue.
    if (employeeId) {
        await roomRepository.markRoomAsRead(roomId, employeeId);
    }
    // Transforme les noms de colonnes SQL en noms utilises par le frontend.
    return history.map((message) => ({
        // Identifiant du message.
        id: message.id,
        // Identifiant de la room.
        roomId: message.room_id,
        // Identifiant de l'expediteur.
        senderId: message.sender_id,
        // Nom affiche de l'expediteur.
        senderName: message.sender_name,
        // Contenu du message.
        text: message.text,
        // Date d'envoi du message.
        timestamp: message.createdAt
    }));
}

// Exporte les fonctions utilisees par les routes REST et les sockets.
module.exports = {
    getRoomById,
    getRoomByTicketId,
    listRoomsForRole,
    getRoomHistory,
    markRoomAsRead,
    assertRoomAccess
};
