const employeeRepository = require('./employees.repository');
const bcrypt = require('bcrypt');
const { createEmployeeValidation, updateEmployeeValidation } = require('./employees.validation');

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

const editEmployee = async (id, employeeData) => {
    await updateEmployeeValidation(employeeData);
    if (employeeData.password) {
        employeeData.password = await bcrypt.hash(employeeData.password, 10);
    }
    return await employeeRepository.update(id, employeeData);
};//REVIEW - modifie it

const getAllEmployees = async () => {
    return await employeeRepository.findAll();
};

const deleteEmployee = async (id) => {
    return await employeeRepository.Delete(id);
};

module.exports = { createEmployee, editEmployee, getAllEmployees, deleteEmployee };