const app = require("./app");
const dotenv = require("dotenv");
const http = require("http");
const { initializeSocket } = require("./socket");
const initializeMessagingSchema = require("./database/initSchema");
const seedTicketExamples = require("./database/seedTicketExamples");
const { startAutomaticGmailSync } = require("./modules/clientEmails/gmailSync.services");

dotenv.config();

const PORT = process.env.PORT || 2300;
const server = http.createServer(app);

initializeSocket(server);

async function startServer() {
  try {
    await initializeMessagingSchema();
    await seedTicketExamples();

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      startAutomaticGmailSync();
    });
  } catch (error) {
    console.error("Failed to initialize server:", error.message);
    process.exit(1);
  }
}

startServer();
