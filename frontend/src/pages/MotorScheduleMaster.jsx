import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function MotorScheduleMaster() {
    const [motorSchedules, setMotorSchedules] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [workTypes, setWorkTypes] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const serviceTypeOptions = ['Bearing', 'Greasing', 'Winding'];

    const [formData, setFormData] = useState({
        dept_id: '',
        schedule_name: '',
        work_id: '',
        frequency: '',
        group_id: '',
        description: '',
        service_type: 'Bearing',
        is_deactivated: false
    });

    // Fetch all data
    const fetchData = async () => {
        try {
            setLoading(true);
            const [schedulesRes, deptsRes, workTypesRes, groupsRes] = await Promise.all([
                axios.get(`${API_URL}/motor-schedules`),
                axios.get(`${API_URL}/departments`),
                axios.get(`${API_URL}/workTypes`),
                axios.get(`${API_URL}/groups`)
            ]);

            setMotorSchedules(schedulesRes.data.data);
            setDepartments(deptsRes.data.data);
            setWorkTypes(workTypesRes.data.data);
            setGroups(groupsRes.data.data);
        } catch (error) {
            setError('Error fetching data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validate schedule name
        if (!formData.schedule_name.trim()) {
            setError('Schedule Name is required');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
                dept_id: parseInt(formData.dept_id),
                work_id: parseInt(formData.work_id),
                group_id: parseInt(formData.group_id),
                frequency: parseInt(formData.frequency)
            };

            if (editingId) {
                await axios.put(`${API_URL}/motor-schedules/${editingId}`, payload);
            } else {
                await axios.post(`${API_URL}/motor-schedules`, payload);
            }
            resetForm();
            fetchData();
        } catch (error) {
            setError('Error saving schedule: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (schedule) => {
        setFormData({
            dept_id: schedule.dept_id || '',
            schedule_name: schedule.schedule_name || '',
            work_id: schedule.work_id || '',
            frequency: schedule.frequency || '',
            group_id: schedule.group_id || '',
            description: schedule.description || '',
            service_type: schedule.service_type || 'Bearing',
            is_deactivated: schedule.is_deactivated || false
        });
        setEditingId(schedule.motor_schedule_id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this motor schedule?')) return;
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/motor-schedules/${id}`);
            fetchData();
        } catch (error) {
            setError('Error deleting schedule: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            dept_id: '',
            schedule_name: '',
            work_id: '',
            frequency: '',
            group_id: '',
            description: '',
            service_type: 'Bearing',
            is_deactivated: false
        });
    };

    if (loading && motorSchedules.length === 0) return <div className="text-center p-4">Loading...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => window.history.back()}
                    className="mb-6 flex items-center gap-2 px-4 py-2 text-indigo-600 hover:text-indigo-800 hover:bg-white rounded-lg transition-all group"
                >
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">Back</span>
                </button>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-800 to-purple-600 bg-clip-text text-transparent">
                                Motor Schedule Master
                            </h1>
                            <p className="text-indigo-600 text-sm">Create and manage motor schedules</p>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                                <h3 className="font-semibold text-red-800 mb-1">Error</h3>
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Add/Edit Form */}
                <div className="bg-white rounded-2xl shadow-xl shadow-indigo-200/50 p-6 mb-6 border border-indigo-200">
                    <div className="flex items-center gap-2 mb-6">
                        {editingId ? (
                            <>
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <h2 className="text-lg font-semibold text-indigo-700">Edit Motor Schedule</h2>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <h2 className="text-lg font-semibold text-indigo-700">Add New Motor Schedule</h2>
                            </>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Department */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Department <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="dept_id"
                                    value={formData.dept_id}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept.dept_id} value={dept.dept_id}>
                                            {dept.dept_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Schedule Name */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Schedule Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="schedule_name"
                                    value={formData.schedule_name}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="Enter schedule name"
                                    required
                                />
                            </div>

                            {/* Work Type */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Work Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="work_id"
                                    value={formData.work_id}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="">Select Work Type</option>
                                    {workTypes.map(work => (
                                        <option key={work.work_id} value={work.work_id}>
                                            {work.work_type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Frequency */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Frequency (Days) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="frequency"
                                    value={formData.frequency}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="Enter frequency"
                                    required
                                />
                            </div>

                            {/* Group */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Group <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="group_id"
                                    value={formData.group_id}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="">Select Group</option>
                                    {groups.map(group => (
                                        <option key={group.group_id} value={group.group_id}>
                                            {group.group_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Service Type */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Service Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="service_type"
                                    value={formData.service_type}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    required
                                >
                                    {serviceTypeOptions.map(type => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Description */}
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    rows="2"
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                                    placeholder="Enter description"
                                />
                            </div>

                            {/* Deactivate Checkbox */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_deactivated"
                                    name="is_deactivated"
                                    checked={formData.is_deactivated}
                                    onChange={handleFormChange}
                                    className="w-4 h-4 text-indigo-600 border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                />
                                <label htmlFor="is_deactivated" className="ml-3 text-sm font-medium text-indigo-700 cursor-pointer">
                                    Deactivate
                                </label>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                                disabled={loading}
                            >
                                {editingId ? (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                        Update Schedule
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Schedule
                                    </>
                                )}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 bg-slate-500 text-white rounded-xl hover:bg-slate-600 transition-all shadow-md flex items-center gap-2 font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Motor Schedules Table */}
                <div className="bg-white rounded-2xl shadow-xl shadow-indigo-200/50 border border-indigo-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200">
                        <h2 className="text-lg font-semibold text-indigo-700">All Motor Schedules</h2>
                        <p className="text-sm text-indigo-600 mt-1">{motorSchedules.length} schedules total</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Schedule Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Department</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Work Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Frequency</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Service Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-indigo-100">
                                {motorSchedules.map(schedule => (
                                    <tr key={schedule.motor_schedule_id} className="hover:bg-indigo-50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-indigo-800">{schedule.schedule_name}</td>
                                        <td className="px-6 py-4 text-indigo-700 font-medium">{schedule.Department?.dept_name || '-'}</td>
                                        <td className="px-6 py-4 text-indigo-700">{schedule.WorkType?.work_type || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1 bg-indigo-100 rounded-full text-sm font-medium text-indigo-700">
                                                {schedule.frequency} days
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                                {schedule.service_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {schedule.is_deactivated ? (
                                                <span className="inline-flex items-center px-3 py-1 bg-red-100 rounded-full text-sm font-medium text-red-700">
                                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                                    Deactivated
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 bg-green-100 rounded-full text-sm font-medium text-green-700">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(schedule)}
                                                    className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all shadow-md shadow-indigo-500/30 flex items-center gap-1 text-sm font-medium"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(schedule.motor_schedule_id)}
                                                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md shadow-red-500/30 flex items-center gap-1 text-sm font-medium"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {motorSchedules.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                                                    <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-lg font-semibold text-indigo-600 mb-2">No schedules yet</h3>
                                                <p className="text-indigo-500">Create your first motor schedule to get started</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Loading Overlay */}
                {loading && (
                    <div className="fixed inset-0 bg-indigo-900/20 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-indigo-700 font-medium">Processing...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}