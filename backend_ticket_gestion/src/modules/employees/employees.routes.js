const express = require('express');
const EmployeeController = require("./employees.controllers");
const auth = require('../../middleware/auth');
const { roleCheck, requireAdminOrSelf } = require('../../middleware/roleCheck');

const router = express.Router();

router.get("/me", auth, EmployeeController.getMe);

// Employee management is restricted to Admin. Users may update only their own basic profile fields.
router.post("/InsertEmp", auth, roleCheck(['ADMIN']), EmployeeController.create);
router.put("/EditEmp/:id", auth, requireAdminOrSelf, EmployeeController.edit);
router.put("/ChangePassword/:id", auth, roleCheck(['ADMIN']), EmployeeController.changePassword);
router.get("/GetAllEmps", auth, roleCheck(['ADMIN']), EmployeeController.getAll);
router.delete("/DeleteEmp/:id", auth, roleCheck(['ADMIN']), EmployeeController.deleteEmp);

module.exports = router;
