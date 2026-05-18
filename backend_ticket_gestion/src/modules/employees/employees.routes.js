const express = require('express');
const EmployeeController = require("./employees.controllers");
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');

const router = express.Router();

router.post("/InsertEmp", auth, roleCheck(['ADMIN']), EmployeeController.create);
router.put("/EditEmp/:id", auth, roleCheck(['ADMIN']), EmployeeController.edit);
router.get("/GetAllEmps", auth, roleCheck(['ADMIN']), EmployeeController.getAll);
router.delete("/DeleteEmp/:id", auth, roleCheck(['ADMIN']), EmployeeController.deleteEmp);

module.exports = router;