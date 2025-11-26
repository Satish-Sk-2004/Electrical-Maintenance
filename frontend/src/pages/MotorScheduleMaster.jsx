import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function MotorScheduleMaster() {
    const [motorSchedules, setMotorSchedules] = useState([]);
    const [motors, setMotors] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        motor_id: '',
        dept_id: '',
        machine_id: '',
        schedule_id: '',
        frequency: '',
        last_service_date: new Date().toISOString().split('T')[0]
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [motorsRes, schedulesRes, deptsRes, machinesRes, motorSchedulesRes] = await Promise.all([
                axios.get(`${API_URL}/motors`),
                axios.get(`${API_URL}/schedules`),
                axios.get(`${API_URL}/departments`),
                axios.get(`${API_URL}/machines`),
                axios.get(`${API_URL}/motor-schedules/lookup`)
            ]);

            setMotors(motorsRes.data.data);
            setSchedules(schedulesRes.data.data);
            setDepartments(deptsRes.data.data);
            setMachines(machinesRes.data.data);
            setMotorSchedules(motorSchedulesRes.data.data);
            setError(null);
        } catch (error) {
            setError('Error fetching data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Get filtered machines by department
    const getFilteredMachines = () => {
        if (!formData.dept_id) return [];
        return machines.filter(m => m.dept_id === Number(formData.dept_id));
    };

    // Handle form change
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Calculate next service date
    const calculateNextServiceDate = () => {
        if (formData.last_service_date && formData.frequency) {
            const lastDate = new Date(formData.last_service_date);
            const nextDate = new Date(lastDate);
            nextDate.setDate(nextDate.getDate() + parseInt(formData.frequency));
            return nextDate.toISOString().split('T')[0];
        }
        return '';
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.motor_id || !formData.schedule_id || !formData.frequency) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);

            const submitData = {
                motor_id: formData.motor_id,
                dept_id: formData.dept_id || null,
                machine_id: formData.machine_id || null,
                schedule_id: Number(formData.schedule_id),
                frequency: parseInt(formData.frequency),
                last_service_date: formData.last_service_date
            };

            if (editingId) {
                await axios.put(`${API_URL}/motor-schedules/${editingId}`, submitData);
                setSuccess('Motor schedule updated successfully');
            } else {
                await axios.post(`${API_URL}/motor-schedules`, submitData);
                setSuccess('Motor schedule created successfully');
            }

            resetForm();
            fetchData();
        } catch (error) {
            setError('Error saving motor schedule: ' + error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle edit
    const handleEdit = (schedule) => {
        setFormData({
            motor_id: schedule.motor_id,
            dept_id: schedule.dept_id || '',
            machine_id: schedule.machine_id || '',
            schedule_id: schedule.schedule_id,
            frequency: schedule.frequency || '',
            last_service_date: schedule.last_service_date?.split('T')[0] || ''
        });
        setEditingId(schedule.allocation_id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle delete
    const handleDelete = async (allocation_id) => {
        if (!confirm('Are you sure you want to delete this schedule?')) return;

        try {
            setLoading(true);
            await axios.delete(`${API_URL}/motor-schedules/${allocation_id}`);
            setSuccess('Motor schedule deleted successfully');
            fetchData();
        } catch (error) {
            setError('Error deleting motor schedule: ' + error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            motor_id: '',
            dept_id: '',
            machine_id: '',
            schedule_id: '',
            frequency: '',
            last_service_date: new Date().toISOString().split('T')[0]
        });
        setEditingId(null);
    };

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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-800 to-purple-600 bg-clip-text text-transparent">
                                Motor Schedule Master
                            </h1>
                            <p className="text-indigo-600 text-sm">Manage motor maintenance schedules</p>
                        </div>
                    </div>
                </div>

                {/* Success Alert */}
                {success && (
                    <div className="mb-6 bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-green-800 mb-1">Success</h3>
                                <p className="text-green-700 text-sm">{success}</p>
                            </div>
                            <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
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

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-xl shadow-indigo-200/50 p-6 mb-6 border border-indigo-200">
                    <h2 className="text-lg font-semibold text-indigo-700 mb-6 flex items-center gap-2">
                        {editingId ? (
                            <>
                                <Edit2 className="w-5 h-5" />
                                Edit Motor Schedule
                            </>
                        ) : (
                            <>
                                <Plus className="w-5 h-5" />
                                New Motor Schedule
                            </>
                        )}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Motor */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Motor <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="motor_id"
                                    value={formData.motor_id}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="">Select Motor</option>
                                    {motors.map(motor => (
                                        <option key={motor.motor_code} value={motor.motor_code}>
                                            {motor.motor_name} ({motor.motor_code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Department */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Department
                                </label>
                                <select
                                    name="dept_id"
                                    value={formData.dept_id}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept.dept_id} value={dept.dept_id}>
                                            {dept.dept_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Machine */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Machine
                                </label>
                                <select
                                    name="machine_id"
                                    value={formData.machine_id}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100"
                                    disabled={!formData.dept_id}
                                >
                                    <option value="">Select Machine</option>
                                    {getFilteredMachines().map(machine => (
                                        <option key={machine.machine_id} value={machine.machine_id}>
                                            {machine.machine_number}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Schedule */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Schedule <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="schedule_id"
                                    value={formData.schedule_id}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                                    placeholder="Enter frequency in days"
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>

                            {/* Last Service Date */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Last Service Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="last_service_date"
                                    value={formData.last_service_date}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Next Service Date Display */}
                        {calculateNextServiceDate() && (
                            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                <p className="text-sm text-indigo-700">
                                    <span className="font-medium">Next Service Date:</span> {calculateNextServiceDate()}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-end pt-4">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                                disabled={loading}
                            >
                                <Plus className="w-5 h-5" />
                                {editingId ? 'Update' : 'Create'} Schedule
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
                        <h2 className="text-lg font-semibold text-indigo-700">Motor Schedules</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Motor</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Schedule</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Department</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Machine</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Frequency</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Last Service</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Next Service</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-indigo-100">
                                {motorSchedules.length > 0 ? (
                                    motorSchedules.map(schedule => (
                                        <tr key={schedule.allocation_id} className="hover:bg-indigo-50 transition-colors">
                                            <td className="px-6 py-4 text-indigo-700 font-medium">
                                                {schedule.Motor?.motor_name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-indigo-700">
                                                {schedule.Schedule?.schedule_name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-indigo-700">
                                                {schedule.Department?.dept_name || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-indigo-700">
                                                {schedule.Machine?.machine_number || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 bg-indigo-100 rounded-full text-sm font-medium text-indigo-700">
                                                    {schedule.frequency} days
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-indigo-700">
                                                {schedule.last_service_date ? new Date(schedule.last_service_date).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-indigo-700">
                                                {schedule.next_service_date ? new Date(schedule.next_service_date).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(schedule)}
                                                        className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all shadow-md shadow-indigo-500/30 flex items-center gap-1 text-sm font-medium"
                                                    >
                                                        <Edit2 className="w-3 h-3" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(schedule.allocation_id)}
                                                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md shadow-red-500/30 flex items-center gap-1 text-sm font-medium"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center">
                                            <p className="text-indigo-500">No motor schedules found</p>
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