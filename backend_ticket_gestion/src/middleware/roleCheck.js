// Generic role check
const roleCheck = (allowedServices) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!allowedServices.includes(user.service)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        next();
    };
};

// Pre‑defined role guards
const requireServiceDelivery = roleCheck(['SD']);
const requireManager = roleCheck(['Manager']);
const requirePKI = roleCheck(['PKI']);
const requireIT = roleCheck(['IT']);
const requireAdmin = roleCheck(['Admin']);
const requireServiceDeliveryOrManager = roleCheck(['SD', 'Manager']);

// Ticket access guard – checks role + resolved status
const requireTicketAccess = (ticketRepository) => {
    return async (req, res, next) => {
        try {
            const ticketId = req.params.ticketId || req.params.id;
            const ticket = await ticketRepository.getTicketById(ticketId);
            if (!ticket) {
                return res.status(404).json({ error: 'Ticket not found' });
            }

            const userService = req.user.service;

            // SD and Manager can access any ticket
            if (userService === 'SD' || userService === 'Manager') {
                req.ticket = ticket; // attach for later use
                return next();
            }

            // PKI / IT only tickets assigned to them
            const assignedServices = ticket.allowed_services || [];
            if (!assignedServices.includes(userService)) {
                return res.status(403).json({ error: 'Access denied: ticket not assigned to your service' });
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
            return res.status(403).json({ error: 'This ticket is resolved and permanently locked' });
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
    requireTicketAccess,
    blockResolvedTicket,
};