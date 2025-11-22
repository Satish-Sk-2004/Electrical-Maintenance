import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Filter, Calendar, CheckCircle, XCircle, ArrowLeft, Clock, Settings as SettingsIcon, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ScheduleAllocation() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [allocations, setAllocations] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [machines, setMachines] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [groups, setGroups] = useState([]);
    const [workTypes, setWorkTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        department: '',
        machine: '',
        group: '',
        schedule: '',
        workType: ''
    });

    const [scheduleAllocationForm, setScheduleAllocationForm] = useState({
        schedule_id: '',
        dept_id: '',
        machine_ids: [],
        last_service_date: '',
        next_service_date: '',
        is_deactivated: false
    });

    const [machineAllocationForm, setMachineAllocationForm] = useState({
        machine_id: '',
        dept_id: '',
        schedule_ids: [],
        last_service_date: '',
        next_service_date: '',
        is_deactivated: false
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [allocationsRes, lookupRes] = await Promise.all([
                axios.get(`${API_URL}/schedule-allocations`),
                axios.get(`${API_URL}/schedule-allocations/lookup`)
            ]);

            setAllocations(allocationsRes.data.data);
            setDepartments(lookupRes.data.data.departments);
            setMachines(lookupRes.data.data.machines);
            setSchedules(lookupRes.data.data.schedules);
            setGroups(lookupRes.data.data.groups);
            setWorkTypes(lookupRes.data.data.workTypes);
        } catch (error) {
            setError('Error fetching data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const filteredAllocations = allocations.filter(allocation => {
        return (!filters.department || allocation.dept_id.toString() === filters.department) &&
               (!filters.machine || allocation.machine_id.toString() === filters.machine) &&
               (!filters.group || allocation.group_id.toString() === filters.group) &&
               (!filters.schedule || allocation.schedule_id.toString() === filters.schedule) &&
               (!filters.workType || allocation.work_id.toString() === filters.workType);
    });

    const handleScheduleAllocation = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const promises = scheduleAllocationForm.machine_ids.map(machine_id => 
                axios.post(`${API_URL}/schedule-allocations`, {
                    schedule_id: scheduleAllocationForm.schedule_id,
                    dept_id: scheduleAllocationForm.dept_id,
                    machine_id,
                    last_service_date: scheduleAllocationForm.last_service_date,
                    next_service_date: scheduleAllocationForm.next_service_date,
                    is_deactivated: scheduleAllocationForm.is_deactivated
                })
            );

            await Promise.all(promises);
            setScheduleAllocationForm({
                schedule_id: '',
                dept_id: '',
                machine_ids: [],
                last_service_date: '',
                next_service_date: '',
                is_deactivated: false
            });
            fetchData();
        } catch (error) {
            setError('Error creating schedule allocations: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMachineAllocation = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const promises = machineAllocationForm.schedule_ids.map(schedule_id => 
                axios.post(`${API_URL}/schedule-allocations`, {
                    machine_id: machineAllocationForm.machine_id,
                    dept_id: machineAllocationForm.dept_id,
                    schedule_id,
                    last_service_date: machineAllocationForm.last_service_date,
                    next_service_date: machineAllocationForm.next_service_date,
                    is_deactivated: machineAllocationForm.is_deactivated
                })
            );

            await Promise.all(promises);
            setMachineAllocationForm({
                machine_id: '',
                dept_id: '',
                schedule_ids: [],
                last_service_date: '',
                next_service_date: '',
                is_deactivated: false
            });
            fetchData();
        } catch (error) {
            setError('Error creating machine allocations: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { name: 'Allocated', icon: List },
        { name: 'By Schedule', icon: Calendar },
        { name: 'By Machine', icon: SettingsIcon }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 px-4 py-2 text-rose-600 hover:text-rose-800 hover:bg-white rounded-lg transition-all group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back</span>
                </button>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-800 to-pink-600 bg-clip-text text-transparent">
                                Schedule Allocation
                            </h1>
                            <p className="text-rose-600 text-sm">Assign schedules to machines and departments</p>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-red-800 mb-1">Error</h3>
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-xl shadow-rose-200/50 border border-rose-200 overflow-hidden mb-6">
                    <div className="flex border-b border-rose-200">
                        {tabs.map((tab, index) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={index}
                                    onClick={() => setActiveTab(index)}
                                    className={`flex-1 px-6 py-4 font-medium transition-all flex items-center justify-center gap-2 ${
                                        activeTab === index
                                            ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg'
                                            : 'text-rose-700 hover:bg-rose-50'
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {tab.name}
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-6">
                        {/* Tab 0: Allocated View */}
                        {activeTab === 0 && (
                            <div>
                                {/* Filters */}
                                <div className="mb-6 bg-rose-50 rounded-xl p-4 border border-rose-200">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Filter className="w-5 h-5 text-rose-600" />
                                        <h3 className="font-semibold text-rose-700">Filters</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-rose-700 mb-2">Department</label>
                                            <select
                                                name="department"
                                                value={filters.department}
                                                onChange={handleFilterChange}
                                                className="w-full px-4 py-2.5 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                                            >
                                                <option value="">All Departments</option>
                                                {departments.map(dept => (
                                                    <option key={dept.dept_id} value={dept.dept_id}>
                                                        {dept.dept_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-rose-700 mb-2">Machine</label>
                                            <select
                                                name="machine"
                                                value={filters.machine}
                                                onChange={handleFilterChange}
                                                className="w-full px-4 py-2.5 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                                            >
                                                <option value="">All Machines</option>
                                                {machines.map(machine => (
                                                    <option key={machine.machine_id} value={machine.machine_id}>
                                                        {machine.machine_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-rose-700 mb-2">Group</label>
                                            <select
                                                name="group"
                                                value={filters.group}
                                                onChange={handleFilterChange}
                                                className="w-full px-4 py-2.5 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                                            >
                                                <option value="">All Groups</option>
                                                {groups.map(group => (
                                                    <option key={group.group_id} value={group.group_id}>
                                                        {group.group_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Allocations Table */}
                                <div className="overflow-x-auto rounded-lg border border-rose-200">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-rose-50 to-pink-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-rose-700 border-b border-rose-200">Department</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-rose-700 border-b border-rose-200">Schedule Name</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-rose-700 border-b border-rose-200">Machine No</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-rose-700 border-b border-rose-200">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        Frequency
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-rose-700 border-b border-rose-200">Last Service</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-rose-700 border-b border-rose-200">Next Service</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-rose-700 border-b border-rose-200">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-rose-100">
                                            {filteredAllocations.map((allocation) => (
                                                <tr key={allocation.allocation_id} className="hover:bg-rose-50 transition-colors">
                                                    <td className="px-6 py-4 text-rose-800">{allocation.Department?.dept_name}</td>
                                                    <td className="px-6 py-4 font-medium text-rose-800">{allocation.Schedule?.schedule_name}</td>
                                                    <td className="px-6 py-4 text-rose-700">{allocation.Machine?.machine_number}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-medium">
                                                            {allocation.Schedule?.frequency} days
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-rose-700">
                                                        {allocation.last_service_date ? new Date(allocation.last_service_date).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-rose-700">
                                                        {allocation.next_service_date ? new Date(allocation.next_service_date).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {allocation.is_deactivated ? (
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
                                                </tr>
                                            ))}
                                            {filteredAllocations.length === 0 && (
                                                <tr>
                                                    <td colSpan="7" className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                                                                <Calendar className="w-8 h-8 text-rose-400" />
                                                            </div>
                                                            <h3 className="text-lg font-semibold text-rose-600 mb-2">No allocations found</h3>
                                                            <p className="text-rose-500">Try adjusting your filters or create a new allocation</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Tab 1: By Schedule */}
                        {activeTab === 1 && (
                            <form onSubmit={handleScheduleAllocation} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-rose-700 mb-2">
                                            Department <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={scheduleAllocationForm.dept_id}
                                            onChange={(e) => setScheduleAllocationForm(prev => ({
                                                ...prev,
                                                dept_id: e.target.value
                                            }))}
                                            className="w-full px-4 py-2.5 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
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

                                    <div>
                                        <label className="block text-sm font-medium text-rose-700 mb-2">
                                            Schedule <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={scheduleAllocationForm.schedule_id}
                                            onChange={(e) => setScheduleAllocationForm(prev => ({
                                                ...prev,
                                                schedule_id: e.target.value
                                            }))}
                                            className="w-full px-4 py-2.5 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
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

                                    <div>
                                        <label className="block text-sm font-medium text-rose-700 mb-2">
                                            Machines (Hold Ctrl/Cmd to select multiple) <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            multiple
                                            value={scheduleAllocationForm.machine_ids}
                                            onChange={(e) => setScheduleAllocationForm(prev => ({
                                                ...prev,
                                                machine_ids: Array.from(e.target.selectedOptions, option => option.value)
                                            }))}
                                            className="w-full px-4 py-2.5 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all h-32"
                                            required
                                        >
                                            {machines.map(machine => (
                                                <option key={machine.machine_id} value={machine.machine_id}>
                                                    {machine.machine_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-rose-700 mb-2">
                                            Last Service Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={scheduleAllocationForm.last_service_date}
                                            onChange={(e) => setScheduleAllocationForm(prev => ({
                                                ...prev,
                                                last_service_date: e.target.value
                                            }))}
                                            className="w-full px-4 py-2.5 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-rose-700 mb-2">
                                            Next Service Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={scheduleAllocationForm.next_service_date}
                                            onChange={(e) => setScheduleAllocationForm(prev => ({
                                                ...prev,
                                                next_service_date: e.target.value
                                            }))}
                                            className="w-full px-4 py-2.5 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center pt-8">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={scheduleAllocationForm.is_deactivated}
                                                onChange={(e) => setScheduleAllocationForm(prev => ({
                                                    ...prev,
                                                    is_deactivated: e.target.checked
                                                }))}
                                                className="w-5 h-5 text-rose-600 border-rose-300 rounded focus:ring-2 focus:ring-rose-500"
                                            />
                                            <span className="text-sm font-medium text-rose-700">Deactivate</span>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:from-rose-700 hover:to-pink-700 shadow-lg shadow-rose-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                                    disabled={loading}
                                >
                                    <Plus className="w-5 h-5" />
                                    Allocate Machine
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Loading Overlay */}
                {loading && (
                    <div className="fixed inset-0 bg-rose-900/20 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-rose-700 font-medium">Processing...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}