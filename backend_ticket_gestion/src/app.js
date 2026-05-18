const express = require("express");
const cors = require("cors");
const authRoutes = require("./modules/auth/auth.routes");
const employeeRoutes = require("./modules/employees/employees.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is working");
});

app.get("/test", (req, res) => {
  res.status(200).json({ message: "test ok" });
});

app.use("/api/auth", authRoutes);
app.use('/api/employees', employeeRoutes);


module.exports = app;