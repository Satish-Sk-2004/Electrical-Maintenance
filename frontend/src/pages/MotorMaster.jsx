import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, AlertCircle, Zap } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function MotorMaster() {
    const [motors, setMotors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [machines, setMachines] = useState([]);
    const [filteredMachines, setFilteredMachines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        dept_id: '',
        machine_id: '',
        make_name: '',
        motor_code: '',
        motor_name: '',
        capacity: '',
        kw: '',
        rpm: '',
        frame_size: '',
        voltage: '',
        current: '',
        motor_description: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [motorsRes, deptRes, machinesRes] = await Promise.all([
                axios.get(`${API_URL}/motors`),
                axios.get(`${API_URL}/departments`),
                axios.get(`${API_URL}/machines`)
            ]);

            setMotors(motorsRes.data.data);
            setDepartments(deptRes.data.data);
            setMachines(machinesRes.data.data);
        } catch (error) {
            setError('Error fetching data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter machines based on selected department
    useEffect(() => {
        if (formData.dept_id) {
            const filtered = machines.filter(
                machine => machine.dept_id === Number(formData.dept_id)
            );
            setFilteredMachines(filtered);
            if (formData.machine_id && !filtered.some(m => m.machine_id === Number(formData.machine_id))) {
                setFormData(prev => ({ ...prev, machine_id: '' }));
            }
        } else {
            setFilteredMachines([]);
            setFormData(prev => ({ ...prev, machine_id: '' }));
        }
    }, [formData.dept_id, machines]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };
            
            // Auto-calculate capacity(HP) from KW
            if (name === 'kw' && value) {
                updated.capacity = (parseFloat(value) / 0.7457).toFixed(2);
            }

            if (name === 'motor_description' && value) {
                updated.motor_description = `${formData.motor_name} (${formData.make_name}) ${updated.kw}kw ${updated.rpm}rpm`;
            }
            
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (editingId) {
                await axios.put(`${API_URL}/motors/${editingId}`, formData);
            } else {
                await axios.post(`${API_URL}/motors`, formData);
            }
            resetForm();
            fetchData();
        } catch (error) {
            setError('Error saving motor: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (motor) => {
        setFormData({
            dept_id: motor.dept_id || '',
            machine_id: motor.machine_id || '',
            make_name: motor.make_name || '',
            motor_code: motor.motor_code || '',
            motor_name: motor.motor_name || '',
            capacity: motor.capacity || '',
            kw: motor.kw || '',
            rpm: motor.rpm || '',
            frame_size: motor.frame_size || '',
            voltage: motor.voltage || '',
            current: motor.current || '',
            motor_description: motor.motor_description || ''
        });
        setEditingId(motor.motor_code);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (motor_code) => {
        if (!confirm('Are you sure you want to delete this motor?')) return;
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/motors/${motor_code}`);
            fetchData();
        } catch (error) {
            setError('Error deleting motor: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            dept_id: '',
            machine_id: '',
            make_name: '',
            motor_code: '',
            motor_name: '',
            capacity: '',
            kw: '',
            rpm: '',
            frame_size: '',
            voltage: '',
            current: '',
            motor_description: ''
        });
    };

    if (loading && motors.length === 0) return <div className="text-center p-4">Loading...</div>;

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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-800 to-purple-600 bg-clip-text text-transparent">
                                Motor Master
                            </h1>
                            <p className="text-indigo-600 text-sm">Manage motor inventory and specifications</p>
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
                                <h2 className="text-lg font-semibold text-indigo-700">Edit Motor</h2>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <h2 className="text-lg font-semibold text-indigo-700">Add New Motor</h2>
                            </>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Motor Code */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Motor Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="motor_code"
                                    value={formData.motor_code}
                                    onChange={handleChange}
                                    placeholder="e.g., MOT001"
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    required
                                    disabled={editingId}
                                />
                            </div>

                            {/* Motor Name */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Motor Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="motor_name"
                                    value={formData.motor_name}
                                    onChange={handleChange}
                                    placeholder="Enter motor name"
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>

                            {/* Department Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Department <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="dept_id"
                                    value={formData.dept_id}
                                    onChange={handleChange}
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

                            {/* Machine Number Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                     Machine Number{/* <span className="text-red-500">*</span> */}
                                </label>
                                <select
                                    name="machine_id"
                                    value={formData.machine_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    disabled={!formData.dept_id}
                                >
                                    <option value="">Select Machine Number</option>
                                    {filteredMachines.map(machine => (
                                        <option key={machine.machine_id} value={machine.machine_id}>
                                            {machine.machine_number}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Make Name Input */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Make Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="make_name"
                                    value={formData.make_name}
                                    onChange={handleChange}
                                    placeholder="Enter make name (e.g., Siemens, ABB, etc.)"
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>

                            {/* Capacity (HP) */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Capacity (HP)
                                </label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    placeholder="Auto-calculated from K.W."
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-indigo-50 cursor-not-allowed"
                                    step="0.1"
                                    readOnly
                                />
                            </div>

                            {/* K.W. */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    K.W.
                                </label>
                                <input
                                    type="number"
                                    name="kw"
                                    value={formData.kw}
                                    onChange={handleChange}
                                    placeholder="Enter K.W."
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    step="0.01"
                                />
                            </div>

                            {/* RPM */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    RPM
                                </label>
                                <input
                                    type="number"
                                    name="rpm"
                                    value={formData.rpm}
                                    onChange={handleChange}
                                    placeholder="Enter RPM"
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Frame Size */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Frame Size
                                </label>
                                <input
                                    type="text"
                                    name="frame_size"
                                    value={formData.frame_size}
                                    onChange={handleChange}
                                    placeholder="e.g., 90L"
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Voltage */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Voltage (V)
                                </label>
                                <input
                                    type="number"
                                    name="voltage"
                                    value={formData.voltage}
                                    onChange={handleChange}
                                    placeholder="e.g., 440"
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Current */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Current (A)
                                </label>
                                <input
                                    type="number"
                                    name="current"
                                    value={formData.current}
                                    onChange={handleChange}
                                    placeholder="Enter current"
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    step="0.1"
                                />
                            </div>

                            {/* Motor Description */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Motor Description
                                </label>
                                <input
                                    type="text"
                                    name="motor_description"
                                    value={formData.motor_description}
                                    onChange={handleChange}
                                    placeholder="Description will be auto-generated"
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-indigo-50 cursor-not-allowed"
                                    step="0.1"
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
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
                                        Update Motor
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Motor
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

                {/* Motors List */}
                <div className="bg-white rounded-2xl shadow-xl shadow-indigo-200/50 border border-indigo-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200">
                        <h2 className="text-lg font-semibold text-indigo-700">All Motors</h2>
                        <p className="text-sm text-indigo-600 mt-1">{motors.length} motors total</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Motor Code</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Motor Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Department</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Machine No</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Make</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Capacity (HP)</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">K.W.</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">RPM</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Voltage</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-indigo-100">
                                {motors.map((motor) => (
                                    <tr key={motor.motor_code} className="hover:bg-indigo-50 transition-colors">
                                        <td className="px-6 py-4 text-indigo-700 font-mono text-sm font-semibold">{motor.motor_code}</td>
                                        <td className="px-6 py-4 font-semibold text-indigo-800">{motor.motor_name}</td>
                                        <td className="px-6 py-4 text-indigo-700">{motor.Department?.dept_name || '-'}</td>
                                        <td className="px-6 py-4 text-indigo-700">{motor.Machine?.machine_number || '-'}</td>
                                        <td className="px-6 py-4 text-indigo-700">{motor.make_name || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 rounded-full text-sm font-medium text-indigo-700">
                                                {motor.capacity || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-indigo-700">{motor.kw || '-'}</td>
                                        <td className="px-6 py-4 text-indigo-700">{motor.rpm || '-'}</td>
                                        <td className="px-6 py-4 text-indigo-700">{motor.voltage || '-'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(motor)}
                                                    className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all shadow-md shadow-indigo-500/30 flex items-center gap-1 text-sm font-medium"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(motor.motor_code)}
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

                                {motors.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="10" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                                                    <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-lg font-semibold text-indigo-600 mb-2">No motors yet</h3>
                                                <p className="text-indigo-500">Add your first motor to get started</p>
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