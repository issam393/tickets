// Importe jsonwebtoken pour verifier la signature du token JWT.
const jwt = require('jsonwebtoken');
// Importe dotenv pour lire les variables du fichier .env.
const dotenv = require('dotenv');
// Importe la verification de blacklist pour refuser un token deconnecte.
const { isBlacklisted } = require('../utils/blacklist');
// Importe le repository auth pour relire l'utilisateur depuis la base.
const authRepository = require('../modules/auth/auth.repository');
// Importe le message commun utilise quand un compte est inactif.
const { INACTIVE_ACCOUNT_MESSAGE } = require('../modules/auth/auth.services');
const { requireEnv } = require('../config/env');

// Charge les variables d'environnement avant d'utiliser JWT_SECRET.
dotenv.config();

// Recupere la cle secrete qui sert a verifier les tokens JWT.
const JWT_SECRET = requireEnv('JWT_SECRET');

// Middleware Socket.IO execute avant d'accepter une connexion temps reel.
async function socketAuthMiddleware(socket, next) {
    try {
        // Recupere le token envoye par le frontend dans le handshake socket.
        const rawToken = socket.handshake?.auth?.token;

        // Refuse la connexion si aucun token n'est fourni.
        if (!rawToken) {
            return next(new Error('Authentication token is required'));
        }

        // Accepte un token brut ou un token sous forme "Bearer <token>".
        const token = rawToken.startsWith('Bearer ')
            ? rawToken.split(' ')[1]
            : rawToken;

        // Refuse un token deja invalide par logout.
        if (isBlacklisted(token)) {
            return next(new Error('Token invalidated. Please login again.'));
        }

        // Verifie la signature et l'expiration du JWT.
        const decoded = jwt.verify(token, JWT_SECRET);
        // Recharge l'employe en base pour verifier son existence et son statut actuel.
        const employee = await authRepository.getUserAccessById(decoded.id);

        // Refuse la connexion si le compte n'existe plus.
        if (!employee) {
            return next(new Error('User account no longer exists. Please login again.'));
        }

        // Refuse la connexion si le compte a ete desactive.
        if (String(employee.status || '').trim().toLowerCase() !== 'active') {
            return next(new Error(INACTIVE_ACCOUNT_MESSAGE));
        }

        // Attache l'utilisateur authentifie au socket pour les evenements suivants.
        socket.user = {
            // Identifiant de l'employe connecte.
            id: decoded.id,
            // Service/role actuel relu depuis la base.
            service: employee.service_name,
            // Nom d'utilisateur venant du token.
            username: decoded.username
        };

        // Autorise la connexion socket.
        next();
    } catch (error) {
        // Retourne une erreur claire si le token est invalide, expire ou si le compte est inactif.
        next(new Error(error.message === INACTIVE_ACCOUNT_MESSAGE ? error.message : 'Invalid or expired token'));
    }
}

// Exporte le middleware pour l'utiliser dans socket/index.js.
module.exports = socketAuthMiddleware;
