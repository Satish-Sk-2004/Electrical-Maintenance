// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [stats, setStats] = useState({
    totalMachines: 0,
    pendingMaintenance: 0,
    completedToday: 0,
    overdueTasks: 0
  });
  const [upcomingMaintenance, setUpcomingMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const statsResponse = await axios.get(
        'http://localhost:5000/api/dashboard/stats',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const maintenanceResponse = await axios.get(
        'http://localhost:5000/api/dashboard/upcoming-maintenance',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStats(statsResponse.data.data);
      setUpcomingMaintenance(maintenanceResponse.data.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'overdue':
        return 'bg-red-100 text-red-700';
      case 'today':
        return 'bg-orange-100 text-orange-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Page Header with User Info */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        {/* <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900">{user.full_name || 'Admin User'}</div>
            <div className="text-xs text-gray-500">{user.role || 'Administrator'}</div>
          </div>
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user.full_name?.charAt(0) || 'A'}
          </div>
        </div> */}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-8">
        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Machines Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-gray-600 mb-2">Total Machines</p>
            <p className="text-4xl font-bold text-gray-900">{stats.totalMachines}</p>
          </div>

          {/* Pending Maintenance Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500 hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-gray-600 mb-2">Pending Maintenance</p>
            <p className="text-4xl font-bold text-gray-900">{stats.pendingMaintenance}</p>
          </div>

          {/* Completed Today Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500 hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-gray-600 mb-2">Completed Today</p>
            <p className="text-4xl font-bold text-gray-900">{stats.completedToday}</p>
          </div>

          {/* Overdue Tasks Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500 hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-gray-600 mb-2">Overdue Tasks</p>
            <p className="text-4xl font-bold text-gray-900">{stats.overdueTasks}</p>
          </div>
        </div>

        {/* Upcoming Maintenance Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Upcoming Maintenance</h2>
            <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              View All
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Machine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingMaintenance.length > 0 ? (
                  upcomingMaintenance.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.machine_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {item.department || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {item.maintenance_type || 'Regular Maintenance'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {new Date(item.scheduled_date).toLocaleDateString('en-CA')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded ${getStatusColor(item.priority)}`}>
                          {item.priority || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <p className="text-sm">No upcoming maintenance scheduled</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
