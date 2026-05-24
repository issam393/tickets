const { Server } = require('socket.io');
const socketAuthMiddleware = require('./auth.middleware');
const registerChatHandlers = require('./chat.handlers');

let ioInstance = null;

function initializeSocket(server) {
    ioInstance = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    ioInstance.use(socketAuthMiddleware);

    ioInstance.on('connection', (socket) => {
        registerChatHandlers(ioInstance, socket);
    });

    return ioInstance;
}

function getIO() {
    if (!ioInstance) {
        throw new Error('Socket.io is not initialized');
    }

    return ioInstance;
}

function disconnectEmployee(employeeId) {
    if (!ioInstance) return;
    ioInstance.sockets.sockets.forEach((socket) => {
        if (Number(socket.user?.id) === Number(employeeId)) {
            socket.emit('account_disabled', {
                message: 'Your account is inactive. Please contact an administrator.'
            });
            socket.disconnect(true);
        }
    });
}

module.exports = {
    initializeSocket,
    getIO,
    disconnectEmployee
};
