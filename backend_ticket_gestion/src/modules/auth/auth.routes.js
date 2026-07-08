const express = require("express");
const authController = require("./auth.controllers");
const { loginLimiter } = require("../../middleware/security");

const router = express.Router();

router.post("/login", loginLimiter, authController.login);
router.post("/logout", authController.logout);

module.exports = router;
