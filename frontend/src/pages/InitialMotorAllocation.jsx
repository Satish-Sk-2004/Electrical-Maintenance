import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, AlertCircle, Zap, ToggleLeft, ToggleRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function InitialMotorAllocation() {
    const [departments, setDepartments] = useState([]);
    const [machines, setMachines] = useState([]);
    const [motors, setMotors] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSpareOnly, setShowSpareOnly] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [activeTab, setActiveTab] = useState('allocation');

    const [formData, setFormData] = useState({
        dept_id: '',
        machine_id: '',
        motors: []
    });

    const [motorAllocations, setMotorAllocations] = useState({});

    const fetchData = async () => {
        try {
            setLoading(true);
            const [deptRes, machinesRes, motorsRes, allocRes] = await Promise.all([
                axios.get(`${API_URL}/departments`),
                axios.get(`${API_URL}/machines`),
                axios.get(`${API_URL}/motors`),
                axios.get(`${API_URL}/motor-allocations`)
            ]);

            setDepartments([
                { dept_id: 'NONE', dept_name: 'NONE (Spare Motors)' },
                ...deptRes.data.data
            ]);
            setMachines(machinesRes.data.data);
            setMotors(motorsRes.data.data);
            setAllocations(allocRes.data.data);
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
    const filteredMachines = () => {
        if (formData.dept_id === 'NONE') {
            return [{ machine_id: 'NONE', machine_number: 'NONE (Spare)' }];
        }
        return machines.filter(m => m.dept_id === Number(formData.dept_id));
    };

    // Get motors for selected machine that are NOT already allocated
    const getMotorsForMachine = () => {
        if (!formData.dept_id || !formData.machine_id) return [];

        const machineObj = machines.find(m => m.machine_id === Number(formData.machine_id));
        const machineNumber = machineObj?.machine_number;

        // Get all allocated motor IDs for this machine (excluding current edit)
        const allocatedMotorIds = allocations
            .filter(a => {
                if (editingId) {
                    return a.allocation_id !== editingId;
                }
                return true;
            })
            .filter(a => a.machine_number === machineNumber)
            .map(a => a.motor_id);

        if (showSpareOnly) {
            return motors.filter(m => {
                const allocation = allocations.find(a => a.motor_id === m.motor_id);
                if (editingId && allocation?.allocation_id === editingId) {
                    return true;
                }
                return !allocatedMotorIds.includes(m.motor_id);
            });
        } else {
            return motors.filter(m => {
                if (editingId && motorAllocations[m.motor_id]?.selected) {
                    return true;
                }
                return !allocatedMotorIds.includes(m.motor_id);
            });
        }
    };

    const handleDepartmentChange = (e) => {
        setFormData({
            dept_id: e.target.value,
            machine_id: '',
            motors: []
        });
        setMotorAllocations({});
    };

    const handleMachineChange = (e) => {
        setFormData(prev => ({
            ...prev,
            machine_id: e.target.value,
            motors: []
        }));
        setMotorAllocations({});
    };

    const handleMotorBearingChange = (motorId, field, value) => {
        setMotorAllocations(prev => ({
            ...prev,
            [motorId]: {
                ...prev[motorId],
                [field]: value,
                selected: prev[motorId]?.selected || false
            }
        }));
    };

    const handleMotorSelect = (motorId) => {
        setMotorAllocations(prev => ({
            ...prev,
            [motorId]: {
                ...prev[motorId],
                selected: !prev[motorId]?.selected,
                bearing_de: prev[motorId]?.bearing_de || '',
                bearing_nde: prev[motorId]?.bearing_nde || '',
                sl_no: prev[motorId]?.sl_no || ''
            }
        }));
    };

    const handleSlNoChange = (motorId, value) => {
        setMotorAllocations(prev => ({
            ...prev,
            [motorId]: {
                ...prev[motorId],
                sl_no: value
            }
        }));
    };

    // In handleSubmit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            // Get machine number
            const machineObj = machines.find(m => m.machine_id === Number(formData.machine_id));
            const machineNumber = machineObj?.machine_number;

            // Collect selected motors with bearing info
            const selectedMotors = Object.entries(motorAllocations)
                .filter(([_, data]) => data.selected)
                .map(([motorId, data]) => {
                    const allocation = {
                        motor_id: motorId,
                        dept_id: formData.dept_id === 'NONE' ? null : Number(formData.dept_id),
                        machine_number: formData.dept_id === 'NONE' ? null : machineNumber,
                        is_spare: formData.dept_id === 'NONE',
                        bearing_de: data.bearing_de && data.bearing_de.trim() ? data.bearing_de : null,
                        bearing_nde: data.bearing_nde && data.bearing_nde.trim() ? data.bearing_nde : null,
                        sl_no: data.sl_no && data.sl_no.trim() ? data.sl_no : null
                    };
                    console.log('Sending allocation data:', allocation);
                    return allocation;
                });

            if (selectedMotors.length === 0) {
                setError('Please select at least one motor');
                setLoading(false);
                return;
            }

            // Save allocations
            for (const motor of selectedMotors) {
                if (editingId) {
                    await axios.put(`${API_URL}/motor-allocations/${editingId}`, motor);
                } else {
                    await axios.post(`${API_URL}/motor-allocations`, motor);
                }
            }

            resetForm();
            fetchData();
            setError(null);
        } catch (error) {
            setError('Error saving allocation: ' + error.response?.data?.message || error.message);
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (allocation) => {
        // Set form data
        setFormData({
            dept_id: allocation.dept_id ? String(allocation.dept_id) : 'NONE',
            machine_id: allocation.machine_id ? String(allocation.machine_id) : 'NONE',
            motors: [allocation.motor_id]
        });

        // Set motor allocations with current data
        setMotorAllocations({
            [allocation.motor_id]: {
                selected: true,
                bearing_de: allocation.bearing_de || '',
                bearing_nde: allocation.bearing_nde || '',
                sl_no: allocation.sl_no || ''
            }
        });

        setEditingId(allocation.allocation_id);
        setShowSpareOnly(false);
        setActiveTab('allocation');

        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (allocation_id) => {
        if (!confirm('Delete this allocation?')) return;
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/motor-allocations/${allocation_id}`);
            fetchData();
            setError(null);
        } catch (error) {
            setError('Error deleting allocation: ' + error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            dept_id: '',
            machine_id: '',
            motors: []
        });
        setMotorAllocations({});
        setEditingId(null);
        setShowSpareOnly(false);
    };

    const getMotorsForList = () => {
        if (showSpareOnly) {
            return allocations.filter(a => a.is_spare);
        }
        return allocations.filter(a => !a.is_spare);
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-800 to-purple-600 bg-clip-text text-transparent">
                                Motor Allocation
                            </h1>
                            <p className="text-indigo-600 text-sm">Allocate motors to machines and manage spare motors</p>
                        </div>
                    </div>
                </div>

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

                {/* Allocation Form */}
                <div className="bg-white rounded-2xl shadow-xl shadow-indigo-200/50 p-6 mb-6 border border-indigo-200">
                    <div className="flex items-center gap-2 mb-6">
                        {editingId ? (
                            <>
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <h2 className="text-lg font-semibold text-indigo-700">Edit Allocation</h2>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <h2 className="text-lg font-semibold text-indigo-700">New Allocation</h2>
                            </>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Department and Machine Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Department */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Department <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.dept_id}
                                    onChange={handleDepartmentChange}
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

                            {/* Machine Number */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Machine Number <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.machine_id}
                                    onChange={handleMachineChange}
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100"
                                    required
                                    disabled={!formData.dept_id}
                                >
                                    <option value="">Select Machine Number</option>
                                    {filteredMachines().map(machine => (
                                        <option key={machine.machine_id} value={machine.machine_id}>
                                            {machine.machine_number}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Spare Motors Toggle */}
                        {formData.dept_id === 'NONE' && (
                            <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                <button
                                    type="button"
                                    onClick={() => setShowSpareOnly(!showSpareOnly)}
                                    className="flex items-center gap-2 text-indigo-700 hover:text-indigo-800 font-medium transition"
                                >
                                    {showSpareOnly ? (
                                        <ToggleRight className="w-6 h-6 text-indigo-600" />
                                    ) : (
                                        <ToggleLeft className="w-6 h-6 text-indigo-400" />
                                    )}
                                    <span>{showSpareOnly ? 'Showing Spare Motors' : 'Show Available Motors'}</span>
                                </button>
                            </div>
                        )}

                        {/* Motors Table */}
                        {formData.dept_id && formData.machine_id && (
                            <div className="border border-indigo-300 rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Select</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Sl.No</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Motor ID</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Motor Name</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Capacity</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Bearing D.E</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Bearing N.D.E</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-indigo-100">
                                            {getMotorsForMachine().map((motor) => (
                                                <tr key={motor.motor_id} className="hover:bg-indigo-50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={motorAllocations[motor.motor_id]?.selected || false}
                                                            onChange={() => handleMotorSelect(motor.motor_id)}
                                                            className="w-5 h-5 text-indigo-600 border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="text"
                                                            value={motorAllocations[motor.motor_id]?.sl_no || ''}
                                                            onChange={(e) => handleSlNoChange(motor.motor_id, e.target.value)}
                                                            placeholder="Enter Sl.No"
                                                            className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                            disabled={!motorAllocations[motor.motor_id]?.selected}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-indigo-700 font-mono text-sm">{motor.motor_id}</td>
                                                    <td className="px-4 py-3 text-indigo-700">{motor.motor_name}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center px-3 py-1 bg-indigo-100 rounded-full text-sm font-medium text-indigo-700">
                                                            {motor.capacity} HP
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="text"
                                                            value={motorAllocations[motor.motor_id]?.bearing_de || ''}
                                                            onChange={(e) => handleMotorBearingChange(motor.motor_id, 'bearing_de', e.target.value)}
                                                            placeholder="Enter bearing"
                                                            className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                            disabled={!motorAllocations[motor.motor_id]?.selected}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="text"
                                                            value={motorAllocations[motor.motor_id]?.bearing_nde || ''}
                                                            onChange={(e) => handleMotorBearingChange(motor.motor_id, 'bearing_nde', e.target.value)}
                                                            placeholder="Enter bearing"
                                                            className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                            disabled={!motorAllocations[motor.motor_id]?.selected}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                            {getMotorsForMachine().length === 0 && (
                                                <tr>
                                                    <td colSpan="7" className="px-4 py-8 text-center text-indigo-500">
                                                        {showSpareOnly ? 'No spare motors available' : 'No motors available for this machine'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-end pt-4">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                                disabled={loading || !formData.dept_id || !formData.machine_id}
                            >
                                <Plus className="w-5 h-5" />
                                {editingId ? 'Update' : 'Save'} Allocation
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

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-xl shadow-indigo-200/50 border border-indigo-200 overflow-hidden">
                    <div className="flex border-b border-indigo-200">
                        <button
                            onClick={() => {
                                setActiveTab('allocation');
                                setShowSpareOnly(false);
                            }}
                            className={`flex-1 px-6 py-4 font-semibold transition-all ${
                                activeTab === 'allocation'
                                    ? 'text-indigo-700 border-b-2 border-indigo-600 bg-indigo-50'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            Allocated Motors
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('spare');
                                setShowSpareOnly(true);
                            }}
                            className={`flex-1 px-6 py-4 font-semibold transition-all ${
                                activeTab === 'spare'
                                    ? 'text-indigo-700 border-b-2 border-indigo-600 bg-indigo-50'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            Spare Motors
                        </button>
                    </div>

                    {/* Allocated Motors List */}
                    {activeTab === 'allocation' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Department</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Machine No</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Motor Code</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Motor Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Sl.No</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Bearing D.E</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Bearing N.D.E</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-indigo-100">
                                    {getMotorsForList().map((allocation) => (
                                        <tr key={allocation.allocation_id} className="hover:bg-indigo-50 transition-colors">
                                            <td className="px-6 py-4 text-indigo-700">{allocation.Department?.dept_name || '-'}</td>
                                            <td className="px-6 py-4 text-indigo-700">{allocation.Machine?.machine_number || '-'}</td>
                                            <td className="px-6 py-4 text-indigo-700 font-mono text-sm">{allocation.motor_id}</td>
                                            <td className="px-6 py-4 text-indigo-700">{allocation.Motor?.motor_name || '-'}</td>
                                            <td className="px-6 py-4 text-indigo-700">{allocation.sl_no || '-'}</td>
                                            <td className="px-6 py-4 text-indigo-700">{allocation.bearing_de || '-'}</td>
                                            <td className="px-6 py-4 text-indigo-700">{allocation.bearing_nde || '-'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(allocation)}
                                                        className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all shadow-md shadow-indigo-500/30 flex items-center gap-1 text-sm font-medium"
                                                    >
                                                        <Edit2 className="w-3 h-3" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(allocation.allocation_id)}
                                                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md shadow-red-500/30 flex items-center gap-1 text-sm font-medium"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {getMotorsForList().length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                                                        <Zap className="w-8 h-8 text-indigo-400" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-indigo-600 mb-2">
                                                        No allocations yet
                                                    </h3>
                                                    <p className="text-indigo-500">
                                                        Create your first allocation
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Spare Motors List */}
                    {activeTab === 'spare' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Motor Code</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Motor Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Make</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Capacity</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Sl.No</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Bearing D.E</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Bearing N.D.E</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-indigo-100">
                                    {getMotorsForList().map((allocation) => (
                                        <tr key={allocation.allocation_id} className="hover:bg-indigo-50 transition-colors">
                                            <td className="px-6 py-4 text-indigo-700 font-mono text-sm">{allocation.motor_id}</td>
                                            <td className="px-6 py-4 text-indigo-700">{allocation.Motor?.motor_name || '-'}</td>
                                            <td className="px-6 py-4 text-indigo-700">{allocation.Motor?.Make?.make_name || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 bg-indigo-100 rounded-full text-sm font-medium text-indigo-700">
                                                    {allocation.Motor?.capacity} HP
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-indigo-700">{allocation.sl_no || '-'}</td>
                                            <td className="px-6 py-4 text-indigo-700">{allocation.bearing_de || '-'}</td>
                                            <td className="px-6 py-4 text-indigo-700">{allocation.bearing_nde || '-'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(allocation)}
                                                        className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all shadow-md shadow-indigo-500/30 flex items-center gap-1 text-sm font-medium"
                                                    >
                                                        <Edit2 className="w-3 h-3" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(allocation.allocation_id)}
                                                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md shadow-red-500/30 flex items-center gap-1 text-sm font-medium"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {getMotorsForList().length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                                                        <Zap className="w-8 h-8 text-indigo-400" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-indigo-600 mb-2">
                                                        No spare motors
                                                    </h3>
                                                    <p className="text-indigo-500">
                                                        Create allocations to add spare motors
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
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