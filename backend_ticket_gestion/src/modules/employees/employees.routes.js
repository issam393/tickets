const express = require('express');
const EmployeeController = require("./employees.controllers");
const auth = require('../../middleware/auth');
const { roleCheck } = require('../../middleware/roleCheck');

const router = express.Router();

router.get("/me", auth, EmployeeController.getMe);

// Employee management – Service Delivery and Admin dashboards only
router.post("/InsertEmp", auth, roleCheck(['SD', 'ADMIN']), EmployeeController.create);
router.put("/EditEmp/:id", auth, roleCheck(['SD', 'ADMIN']), EmployeeController.edit);
router.get("/GetAllEmps", auth, roleCheck(['SD', 'ADMIN']), EmployeeController.getAll);
router.delete("/DeleteEmp/:id", auth, roleCheck(['SD', 'ADMIN']), EmployeeController.deleteEmp);

module.exports = router;
