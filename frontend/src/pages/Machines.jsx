import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Settings, AlertCircle, ArrowLeft, Calendar, Factory, Wrench } from 'lucide-react';
import { Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Machines() {
    const navigate = useNavigate();
    const [machines, setMachines] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [makes, setMakes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        dept_id: '',
        mill_name: '',
        machine_number: '',
        machine_name: '',
        make_id: '',
        year_of_manufacture: '',
        commissioning_date: '',
        manufacturer_name: '',
        version: '',
        remarks: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [machinesRes, deptsRes, makesRes] = await Promise.all([
                axios.get(`${API_URL}/machines`),
                axios.get(`${API_URL}/machines/departments`),
                axios.get(`${API_URL}/machines/makes`)
            ]);

            setMachines(machinesRes.data.data);
            setDepartments(deptsRes.data.data);
            setMakes(makesRes.data.data);
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
                await axios.put(`${API_URL}/machines/${editingId}`, formData);
            } else {
                await axios.post(`${API_URL}/machines`, formData);
            }
            setFormData({
                dept_id: '',
                mill_name: '',
                machine_number: '',
                machine_name: '',
                make_id: '',
                year_of_manufacture: '',
                commissioning_date: '',
                manufacturer_name: '',
                version: '',
                remarks: ''
            });
            setEditingId(null);
            fetchData();
        } catch (error) {
            setError('Error adding machine: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (machine) => {
        setFormData({
            dept_id: machine.dept_id || '',
            mill_name: machine.mill_name || '',
            machine_number: machine.machine_number || '',
            machine_name: machine.machine_name || '',
            make_id: machine.make_id || '',
            year_of_manufacture: machine.year_of_manufacture || '',
            commissioning_date: machine.commissioning_date ? new Date(machine.commissioning_date).toISOString().slice(0,10) : '',
            manufacturer_name: machine.manufacturer_name || '',
            version: machine.version || '',
            remarks: machine.remarks || ''
        });
        setEditingId(machine.machine_id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (machine_id) => {
        if (!confirm('Delete this machine?')) return;
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/machines/${machine_id}`);
            fetchData();
        } catch (error) {
            setError('Error deleting machine: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 px-4 py-2 text-orange-600 hover:text-orange-800 hover:bg-white rounded-lg transition-all group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back</span>
                </button>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Settings className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-800 to-amber-600 bg-clip-text text-transparent">
                                Machines Management
                            </h1>
                            <p className="text-orange-600 text-sm">Track and manage all machinery</p>
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
                                <AlertCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Add Machine Form */}
                <div className="bg-white rounded-2xl shadow-xl shadow-orange-200/50 p-6 mb-6 border border-orange-200">
                    <div className="flex items-center gap-2 mb-6">
                        <Plus className="w-5 h-5 text-orange-600" />
                        <h2 className="text-lg font-semibold text-orange-700">Add New Machine</h2>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Department */}
                            <div>
                                <label className="block text-sm font-medium text-orange-700 mb-2">
                                    Department <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="dept_id"
                                    value={formData.dept_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
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

                            {/* Mill Name */}
                            <div>
                                <label className="block text-sm font-medium text-orange-700 mb-2">
                                    Mill Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="mill_name"
                                    value={formData.mill_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>

                            {/* Machine Number */}
                            <div>
                                <label className="block text-sm font-medium text-orange-700 mb-2">
                                    Machine Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="machine_number"
                                    value={formData.machine_number}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>

                            {/* Machine Name */}
                            <div>
                                <label className="block text-sm font-medium text-orange-700 mb-2">
                                    Machine Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="machine_name"
                                    value={formData.machine_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>

                            {/* Make */}
                            <div>
                                <label className="block text-sm font-medium text-orange-700 mb-2">
                                    Make <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="make_id"
                                    value={formData.make_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="">Select Make</option>
                                    {makes.map(make => (
                                        <option key={make.make_id} value={make.make_id}>
                                            {make.make_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Year of Manufacture */}
                            <div>
                                <label className="block text-sm font-medium text-orange-700 mb-2">
                                    Year of Manufacture
                                </label>
                                <input
                                    type="number"
                                    name="year_of_manufacture"
                                    value={formData.year_of_manufacture}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Commissioning Date */}
                            <div>
                                <label className="block text-sm font-medium text-orange-700 mb-2">
                                    Commissioning Date
                                </label>
                                <input
                                    type="date"
                                    name="commissioning_date"
                                    value={formData.commissioning_date}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Manufacturer Name */}
                            <div>
                                <label className="block text-sm font-medium text-orange-700 mb-2">
                                    Manufacturer Name
                                </label>
                                <input
                                    type="text"
                                    name="manufacturer_name"
                                    value={formData.manufacturer_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Version */}
                            <div>
                                <label className="block text-sm font-medium text-orange-700 mb-2">
                                    Version
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="version"
                                    value={formData.version}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Remarks */}
                        <div>
                            <label className="block text-sm font-medium text-orange-700 mb-2">
                                Remarks
                            </label>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                rows="3"
                            ></textarea>
                        </div>

                        <button 
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl hover:from-orange-700 hover:to-amber-700 shadow-lg shadow-orange-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                            disabled={loading}
                        >
                            <Plus className="w-5 h-5" />
                            {editingId ? 'Update Machine' : 'Add Machine'}
                        </button>
                       {editingId && (
                           <button type="button" onClick={() => { setEditingId(null); setFormData({
                               dept_id: '',
                               mill_name: '',
                               machine_number: '',
                               machine_name: '',
                               make_id: '',
                               year_of_manufacture: '',
                               commissioning_date: '',
                               manufacturer_name: '',
                               version: '',
                               remarks: ''
                           })}} className="px-6 py-3 ml-3 border rounded-lg text-gray-700 hover:bg-gray-50">
                               Cancel
                           </button>
                       )}
                    </form>
                </div>

                {/* Machines List */}
                <div className="bg-white rounded-2xl shadow-xl shadow-orange-200/50 border border-orange-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
                        <h2 className="text-lg font-semibold text-orange-700">All Machines</h2>
                        <p className="text-sm text-orange-600 mt-1">{machines.length} machines total</p>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-orange-50 to-amber-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-orange-700 border-b border-orange-200">
                                        <div className="flex items-center gap-2">
                                            <Wrench className="w-4 h-4" />
                                            Machine ID
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-orange-700 border-b border-orange-200">
                                        Machine No
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-orange-700 border-b border-orange-200">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Comm. Date
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-orange-700 border-b border-orange-200">
                                        <div className="flex items-center gap-2">
                                            <Factory className="w-4 h-4" />
                                            Department
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-orange-700 border-b border-orange-200">
                                        Manufacturer
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-orange-700 border-b border-orange-200">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-100">
                                {machines.map((machine) => (
                                    <tr key={machine.machine_id} className="hover:bg-orange-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center">
                                                    <span className="text-orange-700 font-bold text-xs">
                                                        {machine.machine_id}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-orange-800 font-medium">
                                            {machine.machine_number}
                                        </td>
                                        <td className="px-6 py-4 text-orange-700">
                                            {new Date(machine.commissioning_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-orange-700">
                                            {machine.Department?.dept_name}
                                        </td>
                                        <td className="px-6 py-4 text-orange-700">
                                            {machine.manufacturer_name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(machine)}
                                                    className="px-3 py-1.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-all shadow-md shadow-violet-500/30 flex items-center gap-1 text-sm font-medium"
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(machine.machine_id)}
                                                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md shadow-red-500/30 flex items-center gap-1 text-sm font-medium"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                
                                {machines.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                                                    <Settings className="w-8 h-8 text-orange-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-orange-600 mb-2">No machines yet</h3>
                                                <p className="text-orange-500">Add your first machine to get started</p>
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
                    <div className="fixed inset-0 bg-orange-900/20 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-orange-700 font-medium">Processing...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}