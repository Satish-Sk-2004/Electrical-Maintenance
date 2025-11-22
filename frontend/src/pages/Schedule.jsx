import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Save, X, Calendar, AlertCircle, ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Schedule() {
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [workTypes, setWorkTypes] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        dept_id: '',
        schedule_name: '',
        work_id: '',
        frequency: '',
        is_deactivated: false,
        group_id: '',
        description: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [schedulesRes, lookupRes] = await Promise.all([
                axios.get(`${API_URL}/schedules`),
                axios.get(`${API_URL}/schedules/lookup`)
            ]);

            setSchedules(schedulesRes.data.data);
            setDepartments(lookupRes.data.data.departments);
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
            await axios.post(`${API_URL}/schedules`, formData);
            setFormData({
                dept_id: '',
                schedule_name: '',
                work_id: '',
                frequency: '',
                is_deactivated: false,
                group_id: '',
                description: ''
            });
            fetchData();
        } catch (error) {
            setError('Error adding schedule: ' + error.message);
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

    const handleEdit = (schedule) => {
        setEditingId(schedule.schedule_id);
        setFormData({
            dept_id: schedule.dept_id,
            schedule_name: schedule.schedule_name,
            work_id: schedule.work_id,
            frequency: schedule.frequency,
            is_deactivated: schedule.is_deactivated,
            group_id: schedule.group_id,
            description: schedule.description || ''
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await axios.put(`${API_URL}/schedules/${editingId}`, formData);
            setEditingId(null);
            setFormData({
                dept_id: '',
                schedule_name: '',
                work_id: '',
                frequency: '',
                is_deactivated: false,
                group_id: '',
                description: ''
            });
            fetchData();
        } catch (error) {
            setError('Error updating schedule: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this schedule?')) return;
        
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/schedules/${id}`);
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
            is_deactivated: false,
            group_id: '',
            description: ''
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 px-4 py-2 text-violet-600 hover:text-violet-800 hover:bg-white rounded-lg transition-all group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back</span>
                </button>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-800 to-fuchsia-600 bg-clip-text text-transparent">
                                Schedule Management
                            </h1>
                            <p className="text-violet-600 text-sm">Plan and organize maintenance schedules</p>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-red-800 mb-1">Error</h3>
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Add/Edit Schedule Form */}
                <div className="bg-white rounded-2xl shadow-xl shadow-violet-200/50 p-6 mb-6 border border-violet-200">
                    <div className="flex items-center gap-2 mb-6">
                        {editingId ? (
                            <>
                                <Edit2 className="w-5 h-5 text-violet-600" />
                                <h2 className="text-lg font-semibold text-violet-700">Edit Schedule</h2>
                            </>
                        ) : (
                            <>
                                <Plus className="w-5 h-5 text-violet-600" />
                                <h2 className="text-lg font-semibold text-violet-700">Add New Schedule</h2>
                            </>
                        )}
                    </div>
                    
                    <form onSubmit={editingId ? handleUpdate : handleSubmit} className="space-y-6">
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

                            {/* Schedule Name */}
                            <div>
                                <label className="block text-sm font-medium text-violet-700 mb-2">
                                    Schedule Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="schedule_name"
                                    value={formData.schedule_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    required
                                />
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
                                    <Clock className="w-4 h-4" />
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
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-violet-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                rows="3"
                            ></textarea>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                type="submit"
                                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-700 hover:to-fuchsia-700 shadow-lg shadow-violet-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                                disabled={loading}
                            >
                                {editingId ? (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Update Schedule
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5" />
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
                                    <X className="w-5 h-5" />
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Schedules List */}
                <div className="bg-white rounded-2xl shadow-xl shadow-violet-200/50 border border-violet-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 border-b border-violet-200">
                        <h2 className="text-lg font-semibold text-violet-700">All Schedules</h2>
                        <p className="text-sm text-violet-600 mt-1">{schedules.length} schedules total</p>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-violet-50 to-fuchsia-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">
                                        ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">
                                        Schedule Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Frequency
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">
                                        Group
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">
                                        Department
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-violet-100">
                                {schedules.map((schedule) => (
                                    <tr key={schedule.schedule_id} className="hover:bg-violet-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-8 h-8 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-lg flex items-center justify-center">
                                                <span className="text-violet-700 font-bold text-xs">
                                                    {schedule.schedule_id}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-violet-800">
                                                {schedule.schedule_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-violet-700">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-100 rounded-full text-sm font-medium">
                                                <Clock className="w-3 h-3" />
                                                {schedule.frequency} days
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-violet-700">
                                            {schedule.Group?.group_name}
                                        </td>
                                        <td className="px-6 py-4 text-violet-700">
                                            {schedule.Department?.dept_name}
                                        </td>
                                        <td className="px-6 py-4">
                                            {schedule.is_deactivated ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                                    <XCircle className="w-4 h-4" />
                                                    Inactive
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(schedule)}
                                                    className="px-3 py-1.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-all shadow-md shadow-violet-500/30 flex items-center gap-1 text-sm font-medium"
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(schedule.schedule_id)}
                                                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md shadow-red-500/30 flex items-center gap-1 text-sm font-medium"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                
                                {schedules.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-4">
                                                    <Calendar className="w-8 h-8 text-violet-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-violet-600 mb-2">No schedules yet</h3>
                                                <p className="text-violet-500">Add your first schedule to get started</p>
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