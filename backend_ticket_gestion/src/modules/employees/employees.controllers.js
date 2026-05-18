const employeeService = require('./employees.services');

const create = async (req, res) => {
    try {
        console.log('Received body:', req.body);
        const result = await employeeService.createEmployee(req.body);
        res.status(201).json({ message: 'Employee created', data: result });
    } catch (error) {
        console.log('Error details:', error);
        res.status(500).json({ error: error.message });
    }
};

const edit = async (req, res) => {
    try {
        const result = await employeeService.editEmployee(req.params.id, req.body);
        res.status(200).json({ message: 'Employee updated', data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAll = async (req, res) => {
    try {
        const result = await employeeService.getAllEmployees();
        res.status(200).json({ data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteEmp = async (req, res) => {
    try {
        const result = await employeeService.deleteEmployee(req.params.id);
        res.status(200).json({ message: 'Employee deleted', data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { create, edit, getAll, deleteEmp };