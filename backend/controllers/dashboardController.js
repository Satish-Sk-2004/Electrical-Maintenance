const db = require('../config/database');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Total Machines
    const [totalMachines] = await db.query(
      'SELECT COUNT(*) as total FROM machines WHERE status = "Active"'
    );

    // Pending Maintenance
    const [pendingMaintenance] = await db.query(
      `SELECT COUNT(*) as total FROM maintenance_schedules 
       WHERE status = "Pending" OR status = "Scheduled"`
    );

    // Completed Today
    const today = new Date().toISOString().split('T')[0];
    const [completedToday] = await db.query(
      `SELECT COUNT(*) as total FROM maintenance_schedules 
       WHERE status = "Completed" AND DATE(completed_date) = ?`,
      [today]
    );

    // Overdue Tasks
    const [overdueTasks] = await db.query(
      `SELECT COUNT(*) as total FROM maintenance_schedules 
       WHERE status IN ("Pending", "Scheduled") 
       AND scheduled_date < CURDATE()`
    );

    res.json({
      success: true,
      data: {
        totalMachines: totalMachines[0].total,
        pendingMaintenance: pendingMaintenance[0].total,
        completedToday: completedToday[0].total,
        overdueTasks: overdueTasks[0].total
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// Get upcoming maintenance list
exports.getUpcomingMaintenance = async (req, res) => {
  try {
    const [maintenance] = await db.query(
      `SELECT 
        ms.id,
        m.machine_name,
        m.department,
        ms.scheduled_date,
        ms.status,
        CASE 
          WHEN ms.scheduled_date < CURDATE() THEN 'Overdue'
          WHEN ms.scheduled_date = CURDATE() THEN 'Today'
          ELSE 'Pending'
        END as priority
      FROM maintenance_schedules ms
      JOIN machines m ON ms.machine_id = m.id
      WHERE ms.status IN ('Pending', 'Scheduled')
      ORDER BY ms.scheduled_date ASC
      LIMIT 5`
    );

    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Error fetching upcoming maintenance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming maintenance',
      error: error.message
    });
  }
};