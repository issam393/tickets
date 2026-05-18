const app = require("./app");
const dotenv = require("dotenv");
const http = require("http");
const { initializeSocket } = require("./socket");
const initializeMessagingSchema = require("./database/initSchema");

dotenv.config();

const PORT = process.env.PORT || 2300;
const server = http.createServer(app);

initializeSocket(server);

async function startServer() {
  try {
    await initializeMessagingSchema();

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize server:", error.message);
    process.exit(1);
  }
}

startServer();