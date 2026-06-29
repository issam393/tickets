// Importe la classe Server de Socket.IO pour creer le serveur temps reel.
const { Server } = require('socket.io');
// Importe le middleware qui verifie le JWT avant d'accepter une connexion socket.
const socketAuthMiddleware = require('./auth.middleware');
// Importe les evenements de chat: join_room, send_message et mark_room_read.
const registerChatHandlers = require('./chat.handlers');

// Garde une reference globale vers l'instance Socket.IO pour la reutiliser ailleurs.
let ioInstance = null;

// Initialise Socket.IO sur le serveur HTTP deja cree dans index.js.
function initializeSocket(server) {
    // Cree le serveur Socket.IO et configure les autorisations CORS.
    ioInstance = new Server(server, {
        // Autorise les connexions socket venant du frontend.
        cors: {
            // Accepte toutes les origines en developpement.
            origin: '*',
            // Autorise les methodes HTTP utilisees pendant le handshake Socket.IO.
            methods: ['GET', 'POST']
        }
    });

    // Applique l'authentification JWT avant chaque connexion socket.
    ioInstance.use(socketAuthMiddleware);

    // Ecoute chaque nouvelle connexion acceptee par le middleware.
    ioInstance.on('connection', (socket) => {
        // Attache les evenements de messagerie a ce socket connecte.
        registerChatHandlers(ioInstance, socket);
    });

    // Retourne l'instance creee pour permettre son utilisation si necessaire.
    return ioInstance;
}

// Donne acces a l'instance Socket.IO deja initialisee.
function getIO() {
    // Evite d'utiliser Socket.IO avant son initialisation.
    if (!ioInstance) {
        throw new Error('Socket.io is not initialized');
    }

    // Retourne l'instance active.
    return ioInstance;
}

// Deconnecte en temps reel un employe dont le compte vient d'etre desactive.
function disconnectEmployee(employeeId) {
    // Si Socket.IO n'est pas pret, il n'y a rien a deconnecter.
    if (!ioInstance) return;
    // Parcourt tous les sockets actuellement connectes.
    ioInstance.sockets.sockets.forEach((socket) => {
        // Compare l'id de l'utilisateur connecte avec l'employe cible.
        if (Number(socket.user?.id) === Number(employeeId)) {
            // Informe le frontend que le compte est devenu inactif.
            socket.emit('account_disabled', {
                message: 'Your account is inactive. Please contact an administrator.'
            });
            // Coupe immediatement la connexion socket.
            socket.disconnect(true);
        }
    });
}

// Exporte les fonctions utilisees par le reste du backend.
module.exports = {
    initializeSocket,
    getIO,
    disconnectEmployee
};
