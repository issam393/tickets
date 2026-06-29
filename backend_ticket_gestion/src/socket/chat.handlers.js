// Importe le service des rooms pour verifier l'acces et charger l'historique.
const roomService = require('../modules/rooms/rooms.services');
// Importe le repository des messages pour sauvegarder les messages en base.
const messageRepository = require('../modules/messages/messages.repository');
// Importe le repository auth pour reverifier le statut du compte.
const authRepository = require('../modules/auth/auth.repository');
// Importe le message utilise quand un compte est inactif.
const { INACTIVE_ACCOUNT_MESSAGE } = require('../modules/auth/auth.services');
// Importe l'outil qui transforme un id de room en nom de room Socket.IO.
const { toSocketRoom } = require('../utils/roomAccess');

// Envoie une reponse au frontend si un callback d'accuse de reception existe.
function sendAck(ack, payload) {
    // Verifie que le deuxieme argument fourni par le frontend est bien une fonction.
    if (typeof ack === 'function') {
        // Renvoie le resultat de l'action au frontend.
        ack(payload);
    }
}

// Verifie que l'employe lie au socket existe encore et reste actif.
async function assertActiveEmployee(socket) {
    // Recharge l'utilisateur depuis la base a partir de son id stocke dans socket.user.
    const employee = await authRepository.getUserAccessById(socket.user.id);
    // Bloque l'action si le compte n'existe plus ou n'est plus actif.
    if (!employee || String(employee.status || '').trim().toLowerCase() !== 'active') {
        throw new Error(INACTIVE_ACCOUNT_MESSAGE);
    }
    // Met a jour le service du socket avec la valeur actuelle de la base.
    socket.user.service = employee.service_name;
}

// Enregistre tous les evenements de chat disponibles pour un socket connecte.
function registerChatHandlers(io, socket) {
    // Evenement declenche quand le frontend veut ouvrir une conversation.
    socket.on('join_room', async (payload = {}, ack) => {
        try {
            // Verifie que le compte est toujours actif avant de rejoindre une room.
            await assertActiveEmployee(socket);
            // Convertit l'id de room recu depuis le frontend en nombre.
            const roomId = Number(payload.roomId);
            // Refuse une room absente ou invalide.
            if (!roomId) {
                throw new Error('Valid roomId is required');
            }

            // Charge la room depuis la base.
            const room = await roomService.getRoomById(roomId);
            // Verifie que le service de l'utilisateur a le droit d'acceder a cette room.
            roomService.assertRoomAccess(room, socket.user.service);

            // Charge l'historique des messages et marque la room comme lue pour cet employe.
            const history = await roomService.getRoomHistory(roomId, socket.user.service, socket.user.id);

            // Ajoute le socket dans la room Socket.IO correspondante.
            socket.join(toSocketRoom(roomId));

            // Confirme au frontend que l'acces est accepte et renvoie les donnees utiles.
            sendAck(ack, {
                // Indique que l'operation a reussi.
                success: true,
                // Renvoie les informations principales de la room ouverte.
                room: {
                    // Identifiant technique de la room.
                    id: room.id,
                    // Ticket auquel cette room est rattachee.
                    ticketId: room.ticket_id,
                    // Nom affiche de la room.
                    name: room.name
                },
                // Historique des messages deja enregistres.
                history
            });
        } catch (error) {
            // Renvoie l'erreur au frontend sans faire planter le serveur.
            sendAck(ack, { success: false, error: error.message });
            // Coupe le socket si l'erreur vient d'un compte devenu inactif.
            if (error.message === INACTIVE_ACCOUNT_MESSAGE) socket.disconnect(true);
        }
    });

    // Evenement declenche quand le frontend marque une conversation comme lue.
    socket.on('mark_room_read', async (payload = {}, ack) => {
        try {
            // Reverifie que le compte est toujours actif.
            await assertActiveEmployee(socket);
            // Convertit l'id de room recu en nombre.
            const roomId = Number(payload.roomId);
            // Refuse une room absente ou invalide.
            if (!roomId) {
                throw new Error('Valid roomId is required');
            }

            // Verifie l'acces puis enregistre l'etat de lecture en base.
            await roomService.markRoomAsRead(roomId, socket.user.service, socket.user.id);
            // Confirme au frontend que la room a ete marquee comme lue.
            sendAck(ack, { success: true });
        } catch (error) {
            // Renvoie l'erreur au frontend.
            sendAck(ack, { success: false, error: error.message });
            // Deconnecte l'utilisateur si son compte est devenu inactif.
            if (error.message === INACTIVE_ACCOUNT_MESSAGE) socket.disconnect(true);
        }
    });

    // Evenement declenche quand le frontend envoie un nouveau message.
    socket.on('send_message', async (payload = {}, ack) => {
        try {
            // Reverifie le statut du compte avant d'accepter le message.
            await assertActiveEmployee(socket);
            // Convertit l'id de room recu en nombre.
            const roomId = Number(payload.roomId);
            // Nettoie le texte du message pour eviter les messages vides.
            const messageText = String(payload.messageText || '').trim();

            // Refuse l'envoi si la room est absente ou invalide.
            if (!roomId) {
                throw new Error('Valid roomId is required');
            }

            // Refuse l'envoi si le message est vide.
            if (!messageText) {
                throw new Error('messageText is required');
            }

            // Charge la room concernee.
            const room = await roomService.getRoomById(roomId);
            // Verifie que l'utilisateur a le droit d'ecrire dans cette room.
            roomService.assertRoomAccess(room, socket.user.service);

            // Bloque le Manager car son role est la supervision et non l'ecriture metier.
            if (socket.user.service === 'Manager' || String(socket.user.service).toUpperCase() === 'MANAGER') {
                throw new Error('Action non autorisée');
            }

            // Sauvegarde le message dans MySQL avant de le diffuser.
            const savedMessage = await messageRepository.saveMessage(roomId, socket.user.id, messageText);

            // Prepare le format de message attendu par le frontend.
            const broadcastPayload = {
                // Identifiant du message en base.
                id: savedMessage.id,
                // Room concernee par le message.
                roomId: savedMessage.room_id,
                // Employe qui a envoye le message.
                senderId: savedMessage.sender_id,
                // Nom affiche de l'expediteur.
                senderName: savedMessage.sender_name,
                // Texte du message.
                text: savedMessage.text,
                // Date de creation du message.
                timestamp: savedMessage.createdAt
            };

            // Diffuse le message uniquement aux sockets qui ont rejoint cette room.
            io.to(toSocketRoom(roomId)).emit('receive_message', broadcastPayload);
            // Informe toutes les interfaces que la liste des rooms doit etre rafraichie.
            io.emit('rooms_updated');
            // Confirme a l'expediteur que l'envoi a reussi.
            sendAck(ack, { success: true, data: broadcastPayload });
        } catch (error) {
            // Renvoie l'erreur au frontend si l'envoi a echoue.
            sendAck(ack, { success: false, error: error.message });
            // Deconnecte le socket si le compte est devenu inactif.
            if (error.message === INACTIVE_ACCOUNT_MESSAGE) socket.disconnect(true);
        }
    });
}

// Exporte la fonction appelee a chaque nouvelle connexion socket.
module.exports = registerChatHandlers;
