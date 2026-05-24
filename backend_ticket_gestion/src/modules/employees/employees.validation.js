const createEmployeeValidation = (data) => {
    const { firstName, lastName, email, userName, password, service_id } = data;
    
    const errors = [];
    
    if (!firstName || !lastName || !email || !userName || !password || !service_id) {
        errors.push('All fields are required');
    }
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Invalid email format');
    }
    
    if (userName && !/^[A-Za-z][A-Za-z0-9_]*$/.test(userName)) {
        errors.push('Username must start with a letter and can contain letters, numbers, and underscores only');
    }
    
    if (password) {
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[@$!%*?&+=-_]/.test(password)
        };
        
        if (!checks.length) errors.push('Password must be at least 8 characters');
        if (!checks.uppercase) errors.push('Password must contain at least one uppercase letter');
        if (!checks.lowercase) errors.push('Password must contain at least one lowercase letter');
        if (!checks.number) errors.push('Password must contain at least one number');
        if (!checks.special) errors.push('Password must contain at least one special character (@$!%*?&+=-_)');
        
        if (errors.filter(e => e.includes('Password')).length === 0 && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&+=-_])[A-Za-z\d@$!%*?&+=-_]{8,}$/.test(password)) {
            errors.push('Password format is invalid');
        }
    }
    
    if (errors.length > 0) {
        throw new Error(errors.join('. '));
    }
    
    return true;
};

const updateEmployeeValidation = (data) => {
    const allowedFields = ['firstName', 'lastName', 'email', 'userName', 'service_id', 'status', 'password'];
    const hasValidField = allowedFields.some(field => data[field] !== undefined);
    
    const errors = [];
    
    if (!hasValidField) {
        errors.push('At least one field is required for update');
    }
    
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Invalid email format');
    }
    
    if (data.userName && !/^[A-Za-z][A-Za-z0-9_]*$/.test(data.userName)) {
        errors.push('Username must start with a letter and can contain letters, numbers, and underscores only');
    }

    if (data.status !== undefined && !['Active', 'Inactive'].includes(data.status)) {
        errors.push('Status must be Active or Inactive');
    }
    
    if (data.password) {
        const checks = {
            length: data.password.length >= 8,
            uppercase: /[A-Z]/.test(data.password),
            lowercase: /[a-z]/.test(data.password),
            number: /\d/.test(data.password),
            special: /[@$!%*?&+=-_]/.test(data.password)
        };
        
        if (!checks.length) errors.push('Password must be at least 8 characters');
        if (!checks.uppercase) errors.push('Password must contain at least one uppercase letter');
        if (!checks.lowercase) errors.push('Password must contain at least one lowercase letter');
        if (!checks.number) errors.push('Password must contain at least one number');
        if (!checks.special) errors.push('Password must contain at least one special character (@$!%*?&+=-_)');
    }
    
    if (errors.length > 0) {
        throw new Error(errors.join('. '));
    }
    
    return true;
};

module.exports = { createEmployeeValidation, updateEmployeeValidation };
