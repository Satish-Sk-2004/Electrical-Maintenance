import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle2, Calendar, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function TransactionMotors() {
    const [departments, setDepartments] = useState([]);
    const [machines, setMachines] = useState([]);
    const [motors, setMotors] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [motorSchedules, setMotorSchedules] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [formData, setFormData] = useState({
        date: '',
        dept_id: '',
        motor_id: '',
        machine_id: '',
        serviced_by: 'OWN SERVICE',
        winder_cmp: '',
        other_works: ''
    });

    const [transactionRows, setTransactionRows] = useState([]);
    const [editingTransactionId, setEditingTransactionId] = useState(null);

    const [spareMotors, setSpareMotors] = useState([]);
    const [allocatedMotors, setAllocatedMotors] = useState([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [deptRes, machinesRes, motorsRes, schedulesRes, transRes, allocRes] = await Promise.all([
                axios.get(`${API_URL}/departments`),
                axios.get(`${API_URL}/machines`),
                axios.get(`${API_URL}/motors`),
                axios.get(`${API_URL}/schedules`),
                axios.get(`${API_URL}/transaction-motors`),
                axios.get(`${API_URL}/motor-allocations`)
            ]);

            setDepartments(deptRes.data.data);
            setMachines(machinesRes.data.data);
            setMotors(motorsRes.data.data);
            setSchedules(schedulesRes.data.data);
            setTransactions(transRes.data.data);

            // Separate spare and allocated motors
            const spare = allocRes.data.data.filter(a => a.is_spare);
            const allocated = allocRes.data.data.filter(a => !a.is_spare);
            setSpareMotors(spare);
            setAllocatedMotors(allocated);
        } catch (error) {
            setError('Error fetching data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Get available motors for replacement
    const getAvailableNewMotors = () => {
        const usedMotorIds = transactionRows.map(r => r.new_motor_id).filter(Boolean);
        return spareMotors.filter(sm => !usedMotorIds.includes(sm.motor_id));
    };

    // Get allocated motors for the department
    const getAllocatedMotorsForDept = () => {
        if (!formData.dept_id) return [];
        return allocatedMotors
            .filter(am => am.dept_id === Number(formData.dept_id))
            .map(am => ({
                motor_code: am.motor_id,
                motor_name: motors.find(m => m.motor_code === am.motor_id)?.motor_name || am.motor_id
            }));
    };

    // Get motor name for display
    const getMotorName = (motorCode) => {
        return motors.find(m => m.motor_code === motorCode)?.motor_name || motorCode;
    };

    // Handle initial form change
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Load motors for the department
    const handleLoadMotors = async () => {
        if (!formData.date || !formData.dept_id || !formData.motor_id || !formData.machine_id) {
            setError('Please fill in date, department, motor ID, and machine number');
            return;
        }

        try {
            setLoading(true);

            // Check if transaction already exists for this motor on this date
            const existingTransaction = transactions.find(
                t => t.motor_id === formData.motor_id &&
                    new Date(t.date).toISOString().split('T')[0] === formData.date &&
                    t.machine_id === Number(formData.machine_id)
            );

            // Fetch motor schedules for the selected motor
            const schedulesRes = await axios.get(
                `${API_URL}/motor-schedules/by-motor/${formData.motor_id}`
            );

            setMotorSchedules(schedulesRes.data.data);

            // Initialize transaction rows with motor data
            const motorData = motors.find(m => m.motor_code === formData.motor_id);
            const newRow = {
                id: Date.now(),
                transaction_id: existingTransaction?.transaction_id || null,
                motor_id: formData.motor_id,
                motor_name: motorData?.motor_name || '',
                machine_id: formData.machine_id,
                dept_id: formData.dept_id,
                new_motor_id: existingTransaction?.new_motor_id || '',
                schedule_id: '',
                schedule_name: '',
                frequency: '',
                last_service_date: formData.date,
                next_frequency: 0,
                cycle: 1,
                due_date: '',
                service_date: '',
                ok: false
            };

            setTransactionRows([newRow]);
            if (existingTransaction) {
                setEditingTransactionId(existingTransaction.transaction_id);
            }
            setError(null);
        } catch (error) {
            setError('Error loading motors: ' + error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle row data change
    const handleRowChange = (rowId, field, value) => {
        setTransactionRows(prev =>
            prev.map(row => {
                if (row.id === rowId) {
                    const updatedRow = { ...row, [field]: value };

                    // If schedule is changed, fetch frequency and schedule name
                    if (field === 'schedule_id') {
                        const selectedSchedule = motorSchedules.find(
                            ms => ms.allocation_id === Number(value)
                        );
                        if (selectedSchedule) {
                            updatedRow.frequency = selectedSchedule.frequency || '';
                            updatedRow.schedule_name = selectedSchedule.Schedule?.schedule_name || '';
                            
                            // Calculate due date
                            if (updatedRow.last_service_date && selectedSchedule.frequency) {
                                const lastDate = new Date(updatedRow.last_service_date);
                                const dueDate = new Date(lastDate);
                                dueDate.setDate(dueDate.getDate() + parseInt(selectedSchedule.frequency));
                                updatedRow.due_date = dueDate.toISOString().split('T')[0];
                            }
                        }
                    }

                    // If ok is clicked, set service date to today
                    if (field === 'ok' && value === true) {
                        const today = new Date().toISOString().split('T')[0];
                        updatedRow.service_date = today;
                    }

                    // If ok is unchecked, clear service date
                    if (field === 'ok' && value === false) {
                        updatedRow.service_date = '';
                    }

                    // If last service date is changed, recalculate due date
                    if (field === 'last_service_date' && updatedRow.frequency) {
                        const lastDate = new Date(value);
                        const dueDate = new Date(lastDate);
                        dueDate.setDate(dueDate.getDate() + parseInt(updatedRow.frequency));
                        updatedRow.due_date = dueDate.toISOString().split('T')[0];
                    }

                    return updatedRow;
                }
                return row;
            })
        );
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if any row has ok button clicked
        const completedRows = transactionRows.filter(row => row.ok);
        if (completedRows.length === 0) {
            setError('Please mark at least one row as complete with the OK button');
            return;
        }

        try {
            setLoading(true);

            for (const row of completedRows) {
                const transactionData = {
                    date: formData.date,
                    motor_id: row.motor_id,
                    new_motor_id: row.new_motor_id || null,
                    machine_id: row.machine_id,
                    other_works: formData.other_works || null,
                    ex_mot_rem: null,
                    new_mot_rem: null,
                    serviced_by: formData.serviced_by,
                    winder_cmp: formData.winder_cmp || null
                };

                if (editingTransactionId) {
                    // Update existing transaction
                    await axios.put(`${API_URL}/transaction-motors/${editingTransactionId}`, transactionData);
                } else {
                    // Create new transaction
                    await axios.post(`${API_URL}/transaction-motors`, transactionData);
                }

                // Update motor schedule allocation if schedule was selected
                if (row.schedule_id) {
                    const updateData = {
                        last_service_date: row.service_date || row.last_service_date,
                        next_service_date: row.due_date,
                        frequency: row.cycle || 1
                    };
                    
                    try {
                        await axios.put(
                            `${API_URL}/motor-schedule-allocations/${row.schedule_id}`,
                            updateData
                        );
                    } catch (scheduleError) {
                        console.error('Error updating schedule:', scheduleError);
                    }
                }
            }

            setSuccess(editingTransactionId ? 'Transaction updated successfully' : 'Transaction saved successfully');
            resetForm();
            fetchData();
        } catch (error) {
            setError('Error saving transaction: ' + error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle edit from table
    const handleEditTransaction = (transaction) => {
        setFormData({
            date: new Date(transaction.date).toISOString().split('T')[0],
            dept_id: transaction.dept_id || '',
            motor_id: transaction.motor_id,
            machine_id: transaction.machine_id || '',
            serviced_by: transaction.serviced_by || 'OWN SERVICE',
            winder_cmp: transaction.winder_cmp || '',
            other_works: transaction.other_works || ''
        });

        const motorData = motors.find(m => m.motor_code === transaction.motor_id);
        const newRow = {
            id: Date.now(),
            transaction_id: transaction.transaction_id,
            motor_id: transaction.motor_id,
            motor_name: motorData?.motor_name || '',
            machine_id: transaction.machine_id,
            dept_id: transaction.dept_id,
            new_motor_id: transaction.new_motor_id || '',
            schedule_id: '',
            schedule_name: '',
            frequency: '',
            last_service_date: new Date(transaction.date).toISOString().split('T')[0],
            next_frequency: 0,
            cycle: 1,
            due_date: '',
            service_date: '',
            ok: false
        };

        setTransactionRows([newRow]);
        setEditingTransactionId(transaction.transaction_id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle delete transaction
    const handleDeleteTransaction = async (transaction_id) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;

        try {
            setLoading(true);
            await axios.delete(`${API_URL}/transaction-motors/${transaction_id}`);
            setSuccess('Transaction deleted successfully');
            fetchData();
        } catch (error) {
            setError('Error deleting transaction: ' + error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            date: '',
            dept_id: '',
            motor_id: '',
            machine_id: '',
            serviced_by: 'OWN SERVICE',
            winder_cmp: '',
            other_works: ''
        });
        setTransactionRows([]);
        setMotorSchedules([]);
        setEditingTransactionId(null);
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
                                Transaction Motors
                            </h1>
                            <p className="text-indigo-600 text-sm">Record motor maintenance and replacements</p>
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

                {/* Main Form */}
                <div className="bg-white rounded-2xl shadow-xl shadow-indigo-200/50 p-6 mb-6 border border-indigo-200">
                    <h2 className="text-lg font-semibold text-indigo-700 mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Transaction Details
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Top Form Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>

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

                            {/* Motor Name */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Motor Name <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="motor_id"
                                    value={formData.motor_id}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100"
                                    required
                                    disabled={!formData.dept_id}
                                >
                                    <option value="">Select Motor</option>
                                    {getAllocatedMotorsForDept().map(motor => (
                                        <option key={motor.motor_code} value={motor.motor_code}>
                                            {motor.motor_name}
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
                                    name="machine_id"
                                    value={formData.machine_id}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100"
                                    required
                                    disabled={!formData.dept_id}
                                >
                                    <option value="">Select Machine</option>
                                    {machines
                                        .filter(m => m.dept_id === Number(formData.dept_id))
                                        .map(machine => (
                                            <option key={machine.machine_id} value={machine.machine_id}>
                                                {machine.machine_number}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        {/* Load Motors Button */}
                        {formData.date && formData.dept_id && formData.motor_id && formData.machine_id && (
                            <button
                                type="button"
                                onClick={handleLoadMotors}
                                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2 font-medium"
                            >
                                <Plus className="w-5 h-5" />
                                Load Motors
                            </button>
                        )}

                        {/* Service Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-indigo-200">
                            {/* Serviced By */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Serviced By <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="serviced_by"
                                    value={formData.serviced_by}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="OWN SERVICE">OWN SERVICE</option>
                                    <option value="MOTOR CONTRACTOR">MOTOR CONTRACTOR</option>
                                    <option value="RE-WINDING">RE-WINDING</option>
                                </select>
                            </div>

                            {/* Winder Company */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Winder Company
                                </label>
                                <input
                                    type="text"
                                    name="winder_cmp"
                                    value={formData.winder_cmp}
                                    onChange={handleFormChange}
                                    placeholder="Enter winder company name"
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Other Works */}
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Other Works
                                </label>
                                <input
                                    type="text"
                                    name="other_works"
                                    value={formData.other_works}
                                    onChange={handleFormChange}
                                    placeholder="Enter other works"
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Transaction Details Table */}
                {transactionRows.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl shadow-indigo-200/50 border border-indigo-200 overflow-hidden mb-6">
                        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200">
                            <h2 className="text-lg font-semibold text-indigo-700">Motor Details</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 border-b border-indigo-200">Motor Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 border-b border-indigo-200">New Motor</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 border-b border-indigo-200">Schedule Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 border-b border-indigo-200">Frequency (Days)</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 border-b border-indigo-200">Last Service</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 border-b border-indigo-200">Next Freq</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 border-b border-indigo-200">Cycle</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 border-b border-indigo-200">Due Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-700 border-b border-indigo-200">Service Date</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-indigo-700 border-b border-indigo-200">OK</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-indigo-100">
                                    {transactionRows.map((row) => (
                                        <tr key={row.id} className="hover:bg-indigo-50 transition-colors">
                                            <td className="px-4 py-3 text-indigo-700 font-semibold text-sm">
                                                {row.motor_name}
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={row.new_motor_id}
                                                    onChange={(e) => handleRowChange(row.id, 'new_motor_id', e.target.value)}
                                                    className="w-full px-2 py-1.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                >
                                                    <option value="">Select Spare</option>
                                                    {getAvailableNewMotors().map(motor => (
                                                        <option key={motor.motor_id} value={motor.motor_id}>
                                                            {getMotorName(motor.motor_id)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={row.schedule_id}
                                                    onChange={(e) => handleRowChange(row.id, 'schedule_id', e.target.value)}
                                                    className="w-full px-2 py-1.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                >
                                                    <option value="">Select Schedule</option>
                                                    {motorSchedules.map(ms => (
                                                        <option key={ms.allocation_id} value={ms.allocation_id}>
                                                            {ms.Schedule?.schedule_name || 'N/A'}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    value={row.frequency}
                                                    readOnly
                                                    className="w-full px-2 py-1.5 border border-indigo-300 rounded-lg bg-gray-50 text-indigo-700 text-sm"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="date"
                                                    value={row.last_service_date}
                                                    onChange={(e) => handleRowChange(row.id, 'last_service_date', e.target.value)}
                                                    className="w-full px-2 py-1.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    value={row.next_frequency}
                                                    onChange={(e) => handleRowChange(row.id, 'next_frequency', parseInt(e.target.value) || 0)}
                                                    className="w-full px-2 py-1.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    value={row.cycle}
                                                    readOnly
                                                    className="w-full px-2 py-1.5 border border-indigo-300 rounded-lg bg-gray-50 text-indigo-700 text-sm text-center"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="date"
                                                    value={row.due_date}
                                                    readOnly
                                                    className="w-full px-2 py-1.5 border border-indigo-300 rounded-lg bg-gray-50 text-indigo-700 text-sm"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="date"
                                                    value={row.service_date}
                                                    readOnly
                                                    className="w-full px-2 py-1.5 border border-indigo-300 rounded-lg bg-gray-50 text-indigo-700 text-sm"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRowChange(row.id, 'ok', !row.ok)}
                                                    className={`inline-flex items-center justify-center p-2 rounded-lg transition-all ${
                                                        row.ok
                                                            ? 'bg-green-100 text-green-600'
                                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {row.ok ? (
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Save Button */}
                {transactionRows.length > 0 && (
                    <div className="flex gap-3 justify-end mb-8">
                        <button
                            onClick={() => resetForm()}
                            className="px-6 py-3 bg-slate-500 text-white rounded-xl hover:bg-slate-600 transition-all shadow-md flex items-center gap-2 font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Clear
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {editingTransactionId ? 'Update' : 'Save'} Transaction
                        </button>
                    </div>
                )}

                {/* Saved Transactions Table */}
                <div className="bg-white rounded-2xl shadow-xl shadow-indigo-200/50 border border-indigo-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-indigo-700 flex items-center gap-2">
                            <RefreshCw className="w-5 h-5" />
                            Saved Transactions
                        </h2>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                            {transactions.length}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Motor</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Machine</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">New Motor</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Serviced By</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Other Works</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-indigo-100">
                                {transactions.length > 0 ? (
                                    transactions.map(transaction => (
                                        <tr key={transaction.transaction_id} className="hover:bg-indigo-50 transition-colors">
                                            <td className="px-6 py-4 text-indigo-700 font-medium">
                                                {new Date(transaction.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-indigo-700">
                                                {getMotorName(transaction.motor_id)}
                                            </td>
                                            <td className="px-6 py-4 text-indigo-700">
                                                {machines.find(m => m.machine_id === transaction.machine_id)?.machine_number || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-indigo-700">
                                                {transaction.new_motor_id ? getMotorName(transaction.new_motor_id) : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 bg-blue-100 rounded-full text-sm font-medium text-blue-700">
                                                    {transaction.serviced_by}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-indigo-700">
                                                {transaction.other_works || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditTransaction(transaction)}
                                                        className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all shadow-md shadow-indigo-500/30 flex items-center gap-1 text-sm font-medium"
                                                    >
                                                        <Edit2 className="w-3 h-3" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTransaction(transaction.transaction_id)}
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
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <p className="text-indigo-500">No transactions recorded yet</p>
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