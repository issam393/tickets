const dashboardRepository = require('./dashboard.repository');
const employeeRepository = require('../employees/employees.repository');

async function getCurrentUser(user) {
    if (!user?.id) return null;
    const employee = await employeeRepository.findById(user.id);
    if (!employee) return null;
    return {
        id: employee.id,
        name: [employee.firstName, employee.lastName].filter(Boolean).join(' ') || employee.userName,
        username: employee.userName,
        role: user.service,
        service: employee.service_name,
        email: employee.email
    };
}

async function getManagerDashboard(user) {
    const [
        currentUser,
        ticketStats,
        charts,
        assignmentAnalytics,
        workflowAnalytics,
        crudSummary,
        contactsSummary,
        employeeActivity,
        delayedTickets,
        recentActivity
    ] = await Promise.all([
        getCurrentUser(user),
        dashboardRepository.getTicketStatistics(),
        dashboardRepository.getCharts(),
        dashboardRepository.getAssignmentAnalytics(),
        dashboardRepository.getWorkflowAnalytics(),
        dashboardRepository.getCrudSummary(),
        dashboardRepository.getContactsSummary(),
        dashboardRepository.getEmployeeActivitySummary(),
        dashboardRepository.getDelayedTickets(),
        dashboardRepository.buildSyntheticRecentActivity(24)
    ]);

    return {
        currentUser,
        ticketStats,
        charts,
        assignmentAnalytics,
        workflowAnalytics,
        crudSummary,
        contactsSummary,
        employeeActivity,
        delayedTickets,
        recentActivity
    };
}

async function getSDDashboard(user) {
    const [
        currentUser,
        ticketStats,
        charts,
        workflowAnalytics,
        crudSummary,
        contactsSummary,
        recentTickets,
        pendingAssignmentQueue,
        delayedTickets,
        recentActivity
    ] = await Promise.all([
        getCurrentUser(user),
        dashboardRepository.getTicketStatistics(),
        dashboardRepository.getCharts(),
        dashboardRepository.getWorkflowAnalytics(),
        dashboardRepository.getCrudSummary(),
        dashboardRepository.getContactsSummary(),
        dashboardRepository.getRecentTickets(7),
        dashboardRepository.getPendingAssignmentQueue(12),
        dashboardRepository.getDelayedTickets(),
        dashboardRepository.buildSyntheticRecentActivity(18)
    ]);

    return {
        currentUser,
        ticketStats,
        charts,
        workflowAnalytics,
        crudSummary,
        contactsSummary,
        recentTickets,
        pendingAssignmentQueue,
        delayedTickets,
        recentActivity
    };
}

async function getManagerAnalytics(period, filters) {
    return dashboardRepository.getManagerAnalytics(period, filters);
}

module.exports = {
    getManagerDashboard,
    getSDDashboard,
    getManagerAnalytics
};
