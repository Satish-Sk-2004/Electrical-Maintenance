import { useState, useEffect } from 'react';
import axios from 'axios';
import { Tab } from '@headlessui/react';
import { format, addDays } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function InitialMotorScheduleAllocation() {
    const [allocations, setAllocations] = useState([]);
    const [motors, setMotors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [machines, setMachines] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedTab, setSelectedTab] = useState(0);

    const [formData, setFormData] = useState({
        motor_id: '',
        dept_id: '',
        machine_id: '',
        schedule_id: '',
        frequency: '',
        last_service_date: '',
        next_service_date: '',
        is_deactivated: false
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [allocationsRes, lookupRes] = await Promise.all([
                axios.get(`${API_URL}/motor-schedule-allocations`),
                axios.get(`${API_URL}/motor-schedule-allocations/lookup`)
            ]);

            setAllocations(allocationsRes.data.data);
            setMotors(lookupRes.data.data.motors);
            setDepartments(lookupRes.data.data.departments);
            setMachines(lookupRes.data.data.machines);
            setSchedules(lookupRes.data.data.schedules);
        } catch (error) {
            setError('Error fetching data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleLastServiceDateChange = (e) => {
        const lastServiceDate = e.target.value;
        const frequency = formData.frequency;
        
        let nextServiceDate = '';
        if (lastServiceDate && frequency) {
            nextServiceDate = format(
                addDays(new Date(lastServiceDate), Number(frequency)),
                'yyyy-MM-dd'
            );
        }

        setFormData(prev => ({
            ...prev,
            last_service_date: lastServiceDate,
            next_service_date: nextServiceDate
        }));
    };

    const handleFrequencyChange = (e) => {
        const frequency = e.target.value;
        const lastServiceDate = formData.last_service_date;

        let nextServiceDate = '';
        if (lastServiceDate && frequency) {
            nextServiceDate = format(
                addDays(new Date(lastServiceDate), Number(frequency)),
                'yyyy-MM-dd'
            );
        }

        setFormData(prev => ({
            ...prev,
            frequency,
            next_service_date: nextServiceDate
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await axios.post(`${API_URL}/motor-schedule-allocations`, formData);
            setFormData({
                motor_id: '',
                dept_id: '',
                machine_id: '',
                schedule_id: '',
                frequency: '',
                last_service_date: '',
                next_service_date: '',
                is_deactivated: false
            });
            fetchData();
            setSelectedTab(0);
        } catch (error) {
            setError('Error creating allocation: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (allocationId, currentStatus) => {
        try {
            setLoading(true);
            await axios.patch(`${API_URL}/motor-schedule-allocations/${allocationId}/toggle-status`);
            setAllocations(prev => prev.map(allocation => 
                allocation.allocation_id === allocationId
                    ? { ...allocation, is_deactivated: !currentStatus }
                    : allocation
            ));
        } catch (error) {
            setError('Error updating status: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && allocations.length === 0) {
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-800 to-fuchsia-600 bg-clip-text text-transparent">
                                Motor Schedule Allocation
                            </h1>
                            <p className="text-violet-600 text-sm">Allocate and manage motor service schedules</p>
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

                {/* Tabs */}
                <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                    <Tab.List className="flex space-x-2 bg-white rounded-xl p-2 mb-6 shadow-lg shadow-violet-200/50 border border-violet-200">
                        <Tab className={({ selected }) =>
                            `w-full rounded-lg py-3 px-4 text-sm font-semibold transition-all ${
                                selected
                                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                                    : 'text-violet-600 hover:bg-violet-50'
                            }`
                        }>
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                Allocated Schedules
                            </div>
                        </Tab>
                        <Tab className={({ selected }) =>
                            `w-full rounded-lg py-3 px-4 text-sm font-semibold transition-all ${
                                selected
                                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                                    : 'text-violet-600 hover:bg-violet-50'
                            }`
                        }>
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                New Allocation
                            </div>
                        </Tab>
                    </Tab.List>

                    <Tab.Panels>
                        {/* Allocated Tab */}
                        <Tab.Panel>
                            <div className="bg-white rounded-2xl shadow-xl shadow-violet-200/50 border border-violet-200 overflow-hidden">
                                <div className="px-6 py-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 border-b border-violet-200">
                                    <h2 className="text-lg font-semibold text-violet-700">All Allocations</h2>
                                    <p className="text-sm text-violet-600 mt-1">{allocations.length} allocations total</p>
                                </div>
                                
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-violet-50 to-fuchsia-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">Motor ID</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">Department</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">Machine No</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">Schedule Name</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Frequency
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">Last Service</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">Next Service</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-violet-100">
                                            {allocations.map((allocation) => (
                                                <tr key={allocation.allocation_id} className="hover:bg-violet-50 transition-colors">
                                                    <td className="px-6 py-4 text-violet-700 font-mono text-sm">{allocation.Motor?.motor_code}</td>
                                                    <td className="px-6 py-4 text-violet-700">{allocation.Department?.dept_name}</td>
                                                    <td className="px-6 py-4 text-violet-700 font-semibold">{allocation.Machine?.machine_number}</td>
                                                    <td className="px-6 py-4 text-violet-800 font-semibold">{allocation.Schedule?.schedule_name}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-100 rounded-full text-sm font-medium text-violet-700">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {allocation.frequency} days
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-violet-700">
                                                        <div className="flex items-center gap-2">
                                                            <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            {format(new Date(allocation.last_service_date), 'dd-MM-yyyy')}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-violet-700">
                                                        <div className="flex items-center gap-2">
                                                            <svg className="w-4 h-4 text-fuchsia-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            {format(new Date(allocation.next_service_date), 'dd-MM-yyyy')}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => handleToggleStatus(allocation.allocation_id, allocation.is_deactivated)}
                                                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-md ${
                                                                allocation.is_deactivated
                                                                    ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                                                                    : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                                                            }`}
                                                        >
                                                            {allocation.is_deactivated ? 'Activate' : 'Deactivate'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            
                                            {allocations.length === 0 && !loading && (
                                                <tr>
                                                    <td colSpan="8" className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-4">
                                                                <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                                </svg>
                                                            </div>
                                                            <h3 className="text-lg font-semibold text-violet-600 mb-2">No allocations yet</h3>
                                                            <p className="text-violet-500">Create your first allocation to get started</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </Tab.Panel>

                        {/* Allocation Form Tab */}
                        <Tab.Panel>
                            <div className="bg-white rounded-2xl shadow-xl shadow-violet-200/50 p-6 border border-violet-200">
                                <div className="flex items-center gap-2 mb-6">
                                    <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <h2 className="text-lg font-semibold text-violet-700">Create New Allocation</h2>
                                </div>
                                
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Motor ID */}
                                        <div>
                                            <label className="block text-sm font-medium text-violet-700 mb-2">
                                                Motor ID <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.motor_id}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    motor_id: e.target.value
                                                }))}
                                                className="w-full px-4 py-2.5 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
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
                                            <label className="block text-sm font-medium text-violet-700 mb-2">
                                                Department <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.dept_id}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    dept_id: e.target.value
                                                }))}
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

                                        {/* Machine Number */}
                                        <div>
                                            <label className="block text-sm font-medium text-violet-700 mb-2">
                                                Machine Number <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.machine_id}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    machine_id: e.target.value
                                                }))}
                                                className="w-full px-4 py-2.5 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                                required
                                            >
                                                <option value="">Select Machine</option>
                                                {machines.map(machine => (
                                                    <option key={machine.machine_id} value={machine.machine_id}>
                                                        {machine.machine_number}
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
                                                value={formData.schedule_id}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    schedule_id: e.target.value,
                                                    frequency: schedules.find(s => s.schedule_id.toString() === e.target.value)?.frequency || ''
                                                }))}
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
                                                value={formData.frequency}
                                                onChange={handleFrequencyChange}
                                                className="w-full px-4 py-2.5 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                                required
                                                min="1"
                                            />
                                        </div>

                                        {/* Last Service Date */}
                                        <div>
                                            <label className="block text-sm font-medium text-violet-700 mb-2 flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Last Service Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.last_service_date}
                                                onChange={handleLastServiceDateChange}
                                                className="w-full px-4 py-2.5 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                                required
                                            />
                                        </div>

                                        {/* Next Service Date (Read-only) */}
                                        {formData.next_service_date && (
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-violet-700 mb-2 flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Next Service Date (Auto-calculated)
                                                </label>
                                                <div className="w-full px-4 py-2.5 border border-violet-300 rounded-lg bg-violet-50 text-violet-700 font-semibold">
                                                    {format(new Date(formData.next_service_date), 'dd-MM-yyyy')}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-700 hover:to-fuchsia-700 shadow-lg shadow-violet-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                                            disabled={loading}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                            </svg>
                                            Save Allocation
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>

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