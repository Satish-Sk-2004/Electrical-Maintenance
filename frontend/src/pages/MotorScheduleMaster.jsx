import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function MotorScheduleMaster() {
    const [motorSchedules, setMotorSchedules] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [workTypes, setWorkTypes] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    
    const [formData, setFormData] = useState({
        dept_id: '',
        schedule_id: '',
        work_id: '',
        frequency: '',
        is_deactivated: false,
        group_id: '',
        description: '',
        service_type_id: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [schedulesRes, lookupRes] = await Promise.all([
                axios.get(`${API_URL}/motor-schedules`),
                axios.get(`${API_URL}/motor-schedules/lookup`)
            ]);

            setMotorSchedules(schedulesRes.data.data);
            setDepartments(lookupRes.data.data.departments);
            setSchedules(lookupRes.data.data.schedules);
            setWorkTypes(lookupRes.data.data.workTypes);
            setGroups(lookupRes.data.data.groups);
        } catch (error) {
            setError('Error fetching data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (editingId) {
                await axios.put(`${API_URL}/motor-schedules/${editingId}`, formData);
            } else {
                await axios.post(`${API_URL}/motor-schedules`, formData);
            }
            setFormData({
                dept_id: '',
                schedule_id: '',
                work_id: '',
                frequency: '',
                is_deactivated: false,
                group_id: '',
                description: '',
                service_type_id: ''
            });
            setEditingId(null);
            fetchData();
        } catch (error) {
            setError(`Error ${editingId ? 'updating' : 'adding'} motor schedule: ` + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (schedule) => {
        setEditingId(schedule.motor_schedule_id);
        setFormData({
            dept_id: schedule.dept_id,
            schedule_id: schedule.schedule_id,
            work_id: schedule.work_id,
            frequency: schedule.frequency,
            is_deactivated: schedule.is_deactivated,
            group_id: schedule.group_id,
            description: schedule.description || '',
            service_type_id: schedule.service_type_id
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this schedule?')) return;
        
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/motor-schedules/${id}`);
            fetchData();
        } catch (error) {
            setError('Error deleting motor schedule: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            dept_id: '',
            schedule_id: '',
            work_id: '',
            frequency: '',
            is_deactivated: false,
            group_id: '',
            description: '',
            service_type_id: ''
        });
    };

    if (loading && motorSchedules.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-violet-700 mt-4 text-lg font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => window.history.back()}
                    className="mb-6 flex items-center gap-2 px-4 py-2 text-violet-600 hover:text-violet-800 hover:bg-white rounded-lg transition-all group"
                >
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">Back</span>
                </button>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-800 to-fuchsia-600 bg-clip-text text-transparent">
                                Motor Schedule Master
                            </h1>
                            <p className="text-violet-600 text-sm">Plan and organize motor maintenance schedules</p>
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
                <div className="bg-white rounded-2xl shadow-xl shadow-violet-200/50 p-6 mb-6 border border-violet-200">
                    <div className="flex items-center gap-2 mb-6">
                        {editingId ? (
                            <>
                                <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <h2 className="text-lg font-semibold text-violet-700">Edit Schedule</h2>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <h2 className="text-lg font-semibold text-violet-700">Add New Schedule</h2>
                            </>
                        )}
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Department */}
                            <div>
                                <label className="block text-sm font-medium text-violet-700 mb-2">
                                    Department <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="dept_id"
                                    value={formData.dept_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
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

                            {/* Schedule */}
                            <div>
                                <label className="block text-sm font-medium text-violet-700 mb-2">
                                    Schedule <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="schedule_id"
                                    value={formData.schedule_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="">Select Schedule</option>
                                    {schedules.map(schedule => (
                                        <option key={schedule.schedule_id} value={schedule.schedule_id}>
                                            {schedule.schedule_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Work Type */}
                            <div>
                                <label className="block text-sm font-medium text-violet-700 mb-2">
                                    Work Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="work_id"
                                    value={formData.work_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="">Select Work Type</option>
                                    {workTypes.map(type => (
                                        <option key={type.work_id} value={type.work_id}>
                                            {type.work_type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Frequency */}
                            <div>
                                <label className="block text-sm font-medium text-violet-700 mb-2 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Frequency (Days) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="frequency"
                                    value={formData.frequency}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    required
                                    min="1"
                                />
                            </div>

                            {/* Group */}
                            <div>
                                <label className="block text-sm font-medium text-violet-700 mb-2">
                                    Group <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="group_id"
                                    value={formData.group_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
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
                                <label className="block text-sm font-medium text-violet-700 mb-2">
                                    Service Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="service_type_id"
                                    value={formData.service_type_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="">Select Service Type</option>
                                    {departments.map(dept => (
                                        <option key={dept.dept_id} value={dept.dept_id}>
                                            {dept.dept_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Deactivate Checkbox */}
                            <div className="flex items-center pt-8">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_deactivated"
                                        checked={formData.is_deactivated}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-violet-600 border-violet-300 rounded focus:ring-2 focus:ring-violet-500"
                                    />
                                    <span className="text-sm font-medium text-violet-700">Deactivate Schedule</span>
                                </label>
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-medium text-violet-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                                    rows="3"
                                    placeholder="Enter schedule description..."
                                ></textarea>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-700 hover:to-fuchsia-700 shadow-lg shadow-violet-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
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

                {/* Schedules List */}
                <div className="bg-white rounded-2xl shadow-xl shadow-violet-200/50 border border-violet-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 border-b border-violet-200">
                        <h2 className="text-lg font-semibold text-violet-700">All Motor Schedules</h2>
                        <p className="text-sm text-violet-600 mt-1">{motorSchedules.length} schedules total</p>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-violet-50 to-fuchsia-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">Department</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">Schedule Code</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">Schedule Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">Work Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Frequency
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">Group</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">Service Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">Description</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-violet-100">
                                {motorSchedules.map((schedule) => (
                                    <tr key={schedule.motor_schedule_id} className="hover:bg-violet-50 transition-colors">
                                        <td className="px-6 py-4 text-violet-700">{schedule.Department?.dept_name}</td>
                                        <td className="px-6 py-4 text-violet-700 font-mono text-sm">{schedule.schedule_id}</td>
                                        <td className="px-6 py-4 font-semibold text-violet-800">{schedule.Schedule?.schedule_name}</td>
                                        <td className="px-6 py-4 text-violet-700">{schedule.WorkType?.work_type}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-100 rounded-full text-sm font-medium text-violet-700">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {schedule.frequency} days
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-violet-700">{schedule.Group?.group_name}</td>
                                        <td className="px-6 py-4 text-violet-700">{schedule.ServiceType?.dept_name}</td>
                                        <td className="px-6 py-4">
                                            {schedule.is_deactivated ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Inactive
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-violet-600 text-sm max-w-xs truncate">{schedule.description}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(schedule)}
                                                    className="px-3 py-1.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-all shadow-md shadow-violet-500/30 flex items-center gap-1 text-sm font-medium"
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
                                        <td colSpan="10" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-4">
                                                    <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-lg font-semibold text-violet-600 mb-2">No schedules yet</h3>
                                                <p className="text-violet-500">Add your first motor schedule to get started</p>
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
                    <div className="fixed inset-0 bg-violet-900/20 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-violet-700 font-medium">Processing...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}