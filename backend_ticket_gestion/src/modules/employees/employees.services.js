const employeeRepository = require('./employees.repository');
const bcrypt = require('bcrypt');
const { createEmployeeValidation, updateEmployeeValidation, passwordValidation } = require('./employees.validation');
const { disconnectEmployee } = require('../../socket');

const createEmployee = async (employeeData) => {
    const existingUser = await employeeRepository.isUser(employeeData.userName);
    if (existingUser) {
        throw new Error('Username already exists');
    }
    
    await createEmployeeValidation(employeeData);
    const hashedPassword = await bcrypt.hash(employeeData.password, 10);
    employeeData.password = hashedPassword;
    return await employeeRepository.create(employeeData);
};

const SELF_EDIT_FIELDS = ['firstName', 'lastName', 'email', 'userName', 'password'];

function normalizeService(service) {
    return String(service || '').trim().toUpperCase();
}

const editEmployee = async (id, employeeData, actor = {}) => {
    const isAdmin = normalizeService(actor.service) === 'ADMIN';
    const safeEmployeeData = isAdmin
        ? { ...employeeData }
        : Object.fromEntries(
            Object.entries(employeeData).filter(([key]) => SELF_EDIT_FIELDS.includes(key))
        );

    await updateEmployeeValidation(safeEmployeeData);
    if (safeEmployeeData.password) {
        safeEmployeeData.password = await bcrypt.hash(safeEmployeeData.password, 10);
    }
    const result = await employeeRepository.update(id, safeEmployeeData);
    if (isAdmin && safeEmployeeData.status === 'Inactive') {
        disconnectEmployee(id);
    }
    return result;
};

const getAllEmployees = async () => {
    return await employeeRepository.findAll();
};

const getEmployeeById = async (id) => {
    const employee = await employeeRepository.findById(id);
    if (!employee) {
        throw new Error('Employee not found');
    }
    return employee;
};

const changeEmployeePassword = async (id, password) => {
    await passwordValidation(password);
    const employee = await employeeRepository.findById(id);
    if (!employee) {
        throw new Error('Employee not found');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return await employeeRepository.updatePassword(id, hashedPassword);
};

const deleteEmployee = async (id) => {
    return await employeeRepository.Delete(id);
};

module.exports = { createEmployee, editEmployee, getAllEmployees, getEmployeeById, changeEmployeePassword, deleteEmployee };
