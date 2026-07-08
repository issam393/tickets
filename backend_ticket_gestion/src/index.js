const app = require("./app");
const dotenv = require("dotenv");
const http = require("http");
const { initializeSocket } = require("./socket");
const initializeMessagingSchema = require("./database/initSchema");
const createInitialAdmin = require("./adminInsertion");
const { startAutomaticGmailSync } = require("./modules/clientEmails/gmailSync.services");
const { optionalEnv } = require("./config/env");

dotenv.config();

const PORT = optionalEnv("PORT", "2300");
const server = http.createServer(app);

initializeSocket(server);

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the other server or set PORT to another value.`);
  } else {
    console.error("Server error:", error.message);
  }

  process.exit(1);
});

async function startServer() {
  try {
    await initializeMessagingSchema();
    if (optionalEnv("ENABLE_ADMIN_BOOTSTRAP", "false").toLowerCase() === "true") {
      await createInitialAdmin();
    }

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
