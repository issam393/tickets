const { sendError } = require('../utils/apiResponse');
const { parseAllowedRoles } = require('../utils/roomAccess');

const ACCESS_DENIED_MESSAGE = 'Access denied. Your role does not have permission to view this section.';

function normalizeService(service) {
    if (!service) return '';
    const value = String(service).trim();
    if (value.toUpperCase() === 'MANAGER') return 'Manager';
    if (value.toUpperCase() === 'SERVICE DELIVERY') return 'SD';
    return value.toUpperCase() === value && ['SD', 'PKI', 'IT', 'ADMIN'].includes(value.toUpperCase())
        ? value.toUpperCase()
        : value;
}

// Generic role check
const roleCheck = (allowedServices) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return sendError(res, 401, 'Unauthorized');
        }
        const service = normalizeService(user.service);
        if (!allowedServices.map(normalizeService).includes(service)) {
            return sendError(res, 403, ACCESS_DENIED_MESSAGE);
        }
        req.user.service = service;
        next();
    };
};

// Pre‑defined role guards
const requireServiceDelivery = roleCheck(['SD']);
const requireManager = roleCheck(['Manager']);
const requirePKI = roleCheck(['PKI']);
const requireIT = roleCheck(['IT']);
const requireAdmin = roleCheck(['ADMIN']);
const requireServiceDeliveryOrManager = roleCheck(['SD', 'Manager']);
const requireServiceDeliveryOrManagerOrSupport = roleCheck(['SD', 'Manager', 'PKI', 'IT']);

// Ticket access guard – checks role + resolved status
const requireTicketAccess = (ticketRepository) => {
    return async (req, res, next) => {
        try {
            const ticketId = req.params.ticketId || req.params.id;
            const ticket = await ticketRepository.getTicketById(ticketId);
            if (!ticket) {
                return sendError(res, 404, 'Ticket not found');
            }

            const userService = normalizeService(req.user.service);
            req.user.service = userService;

            // SD and Manager can access any ticket
            if (userService === 'SD' || userService === 'Manager') {
                req.ticket = ticket; // attach for later use
                return next();
            }

            // PKI / IT only tickets assigned to them
            const assignedServices = parseAllowedRoles(ticket.allowed_services);
            if (!assignedServices.includes(userService)) {
                return sendError(res, 403, ACCESS_DENIED_MESSAGE);
            }

            req.ticket = ticket;
            next();
        } catch (err) {
            next(err);
        }
    };
};

// Block any action on a resolved ticket
const blockResolvedTicket = () => {
    return (req, res, next) => {
        const ticket = req.ticket; // must be attached by requireTicketAccess
        if (ticket && ticket.status === 'Resolved') {
            return sendError(res, 400, 'Ticket already resolved. It is permanently locked.');
        }
        next();
    };
};

module.exports = {
    roleCheck,
    requireServiceDelivery,
    requireManager,
    requirePKI,
    requireIT,
    requireAdmin,
    requireServiceDeliveryOrManager,
    requireServiceDeliveryOrManagerOrSupport,
    requireTicketAccess,
    blockResolvedTicket,
    normalizeService,
    ACCESS_DENIED_MESSAGE,
};
