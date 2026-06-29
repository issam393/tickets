const employeeService = require('./employees.services');
const { sendSuccess, sendError, getErrorStatus } = require('../../utils/apiResponse');

const create = async (req, res) => {
    try {
        const result = await employeeService.createEmployee(req.body);
        sendSuccess(res, 201, 'Employee created successfully', result);
    } catch (error) {
        sendError(res, getErrorStatus(error, 400), error.message);
    }
};

const edit = async (req, res) => {
    try {
        const result = await employeeService.editEmployee(req.params.id, req.body);
        sendSuccess(res, 200, 'Employee updated successfully', result);
    } catch (error) {
        sendError(res, getErrorStatus(error, 400), error.message);
    }
};

const getAll = async (req, res) => {
    try {
        const result = await employeeService.getAllEmployees();
        sendSuccess(res, 200, 'Employees loaded successfully', result);
    } catch (error) {
        sendError(res, 500, error.message);
    }
};

const getMe = async (req, res) => {
    try {
        const result = await employeeService.getEmployeeById(req.user.id);
        sendSuccess(res, 200, 'Profile loaded successfully', result);
    } catch (error) {
        sendError(res, getErrorStatus(error, 404), error.message);
    }
};

const changePassword = async (req, res) => {
    try {
        const result = await employeeService.changeEmployeePassword(req.params.id, req.body.password);
        sendSuccess(res, 200, 'Employee password updated successfully', result);
    } catch (error) {
        sendError(res, getErrorStatus(error, 400), error.message);
    }
};

const deleteEmp = async (req, res) => {
    try {
        const result = await employeeService.deleteEmployee(req.params.id);
        sendSuccess(res, 200, 'Employee deleted successfully', result);
    } catch (error) {
        sendError(res, getErrorStatus(error, 400), error.message);
    }
};

module.exports = { create, edit, getAll, getMe, changePassword, deleteEmp };
