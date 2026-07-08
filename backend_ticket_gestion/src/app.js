const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes         = require("./modules/auth/auth.routes");
const employeeRoutes     = require("./modules/employees/employees.routes");
const ticketRoutes       = require("./modules/tickets/tickets.routes");
const roomRoutes         = require("./modules/rooms/rooms.routes");
const meetingRoutes      = require("./modules/meetings/meetings.routes");
const meetingRoomRoutes  = require("./modules/meetingRooms/meetingRooms.routes");
const contactRoutes      = require("./modules/contacts/contacts.routes");
const organizationRoutes = require("./modules/organizations/organizations.routes");
const commentRoutes      = require("./modules/comments/comments.routes");
const dashboardRoutes    = require("./modules/dashboard/dashboard.routes");
const clientEmailRoutes  = require("./modules/clientEmails/clientEmails.routes");
const { corsOptions, globalLimiter } = require("./middleware/security");


const app = express();
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));
app.use(globalLimiter);

app.get("/", (req, res) => res.send("API is working"));
app.get("/test", (req, res) => res.status(200).json({ message: "test ok" }));
app.get("/api", (req, res) => res.status(200).json({ message: "API is working" }));

app.use("/api/auth",          authRoutes);
app.use("/api/employees",     employeeRoutes);
app.use("/api/tickets",       ticketRoutes);
app.use("/api/rooms",         roomRoutes);
app.use("/api/meetings",      meetingRoutes);
app.use("/api/meeting-rooms", meetingRoomRoutes);
app.use("/api/contacts",      contactRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api",               commentRoutes);
app.use("/api/dashboard",     dashboardRoutes);
app.use("/api/client-emails",  clientEmailRoutes);

module.exports = app;
