import { useState, useEffect } from 'react';
import axios from 'axios';
import { Tab } from '@headlessui/react';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Maintenance() {
    const [allocations, setAllocations] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [machines, setMachines] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [workTypes, setWorkTypes] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [filters, setFilters] = useState({
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        dept_id: '',
        machine_id: '',
        schedule_id: '',
        work_id: '',
        group_id: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [allocationsRes, lookupRes] = await Promise.all([
                axios.get(`${API_URL}/maintenance`, {
                    params: filters
                }),
                axios.get(`${API_URL}/maintenance/lookup`)
            ]);

            setAllocations(allocationsRes.data.data);
            setDepartments(lookupRes.data.data.departments);
            setMachines(lookupRes.data.data.machines);
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
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleComplete = async (allocationId) => {
        try {
            setLoading(true);
            await axios.post(`${API_URL}/maintenance/${allocationId}/complete`, {
                service_date: new Date().toISOString()
            });
            fetchData();
        } catch (error) {
            setError('Error completing maintenance: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-4">Loading...</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Schedule Completed</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-4">
                    <Tab className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                        ${selected ? 'bg-white shadow text-blue-700' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
                    }>
                        Pending
                    </Tab>
                    <Tab className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                        ${selected ? 'bg-white shadow text-blue-700' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
                    }>
                        Completed
                    </Tab>
                </Tab.List>

                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded shadow">
                    <div>
                        <label className="block mb-1">Due Period</label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                name="startDate"
                                value={filters.startDate}
                                onChange={handleFilterChange}
                                className="w-full border rounded px-3 py-2"
                            />
                            <input
                                type="date"
                                name="endDate"
                                value={filters.endDate}
                                onChange={handleFilterChange}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1">Work Type</label>
                        <select
                            name="work_id"
                            value={filters.work_id}
                            onChange={handleFilterChange}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">All Work Types</option>
                            {workTypes.map(type => (
                                <option key={type.work_id} value={type.work_id}>
                                    {type.work_type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1">Group</label>
                        <select
                            name="group_id"
                            value={filters.group_id}
                            onChange={handleFilterChange}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">All Groups</option>
                            {groups.map(group => (
                                <option key={group.group_id} value={group.group_id}>
                                    {group.group_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1">Department</label>
                        <select
                            name="dept_id"
                            value={filters.dept_id}
                            onChange={handleFilterChange}
                            className="w-full border rounded px-3 py-2"
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
                        <label className="block mb-1">Machine</label>
                        <select
                            name="machine_id"
                            value={filters.machine_id}
                            onChange={handleFilterChange}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">All Machines</option>
                            {machines.map(machine => (
                                <option key={machine.machine_id} value={machine.machine_id}>
                                    {machine.machine_number}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1">Schedule</label>
                        <select
                            name="schedule_id"
                            value={filters.schedule_id}
                            onChange={handleFilterChange}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">All Schedules</option>
                            {schedules.map(schedule => (
                                <option key={schedule.schedule_id} value={schedule.schedule_id}>
                                    {schedule.schedule_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <Tab.Panels>
                    <Tab.Panel>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border rounded-lg">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 border-b">Department</th>
                                        <th className="px-4 py-2 border-b">McNo</th>
                                        <th className="px-4 py-2 border-b">Schedule Name</th>
                                        <th className="px-4 py-2 border-b">Freq</th>
                                        <th className="px-4 py-2 border-b">LastService</th>
                                        <th className="px-4 py-2 border-b">Cycle</th>
                                        <th className="px-4 py-2 border-b">DueDate</th>
                                        <th className="px-4 py-2 border-b">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allocations
                                        .filter(a => !a.service_date)
                                        .map((allocation) => (
                                        <tr key={allocation.allocation_id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border-b">{allocation.Department?.dept_name}</td>
                                            <td className="px-4 py-2 border-b">{allocation.Machine?.machine_number}</td>
                                            <td className="px-4 py-2 border-b">{allocation.Schedule?.schedule_name}</td>
                                            <td className="px-4 py-2 border-b">{allocation.frequency}</td>
                                            <td className="px-4 py-2 border-b">
                                                {format(new Date(allocation.last_service_date), 'dd-MM-yyyy')}
                                            </td>
                                            <td className="px-4 py-2 border-b">{allocation.cycle}</td>
                                            <td className="px-4 py-2 border-b">
                                                {format(new Date(allocation.next_service_date), 'dd-MM-yyyy')}
                                            </td>
                                            <td className="px-4 py-2 border-b">
                                                <button
                                                    onClick={() => handleComplete(allocation.allocation_id)}
                                                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                                >
                                                    Complete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Tab.Panel>

                    <Tab.Panel>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border rounded-lg">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 border-b">Department</th>
                                        <th className="px-4 py-2 border-b">McNo</th>
                                        <th className="px-4 py-2 border-b">Schedule Name</th>
                                        <th className="px-4 py-2 border-b">Freq</th>
                                        <th className="px-4 py-2 border-b">LastService</th>
                                        <th className="px-4 py-2 border-b">Cycle</th>
                                        <th className="px-4 py-2 border-b">DueDate</th>
                                        <th className="px-4 py-2 border-b">Service Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allocations
                                        .filter(a => a.service_date)
                                        .map((allocation) => (
                                        <tr key={allocation.allocation_id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border-b">{allocation.Department?.dept_name}</td>
                                            <td className="px-4 py-2 border-b">{allocation.Machine?.machine_number}</td>
                                            <td className="px-4 py-2 border-b">{allocation.Schedule?.schedule_name}</td>
                                            <td className="px-4 py-2 border-b">{allocation.frequency}</td>
                                            <td className="px-4 py-2 border-b">
                                                {format(new Date(allocation.last_service_date), 'dd-MM-yyyy')}
                                            </td>
                                            <td className="px-4 py-2 border-b">{allocation.cycle}</td>
                                            <td className="px-4 py-2 border-b">
                                                {format(new Date(allocation.next_service_date), 'dd-MM-yyyy')}
                                            </td>
                                            <td className="px-4 py-2 border-b">
                                                {format(new Date(allocation.service_date), 'dd-MM-yyyy')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
}