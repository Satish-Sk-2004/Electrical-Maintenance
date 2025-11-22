import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Save, X, Building2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Department() {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newDepartment, setNewDepartment] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/departments`);
            if (response.data.success) {
                setDepartments(response.data.data);
            }
        } catch (error) {
            setError('Error fetching departments: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleAddDepartment = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await axios.post(`${API_URL}/departments`, {
                dept_name: newDepartment
            });
            setNewDepartment('');
            fetchDepartments();
        } catch (error) {
            setError('Error adding department: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (dept) => {
        setEditingId(dept.dept_id);
        setEditName(dept.dept_name);
    };

    const handleUpdate = async (id) => {
        try {
            setLoading(true);
            await axios.put(`${API_URL}/departments/${id}`, {
                dept_name: editName
            });
            setEditingId(null);
            fetchDepartments();
        } catch (error) {
            setError('Error updating department: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;
        
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/departments/${id}`);
            fetchDepartments();
        } catch (error) {
            setError('Error deleting department: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-white rounded-lg transition-all group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back</span>
                </button>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                Department Management
                            </h1>
                            <p className="text-slate-500 text-sm">Organize and manage your departments</p>
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

                {/* Add Department Form */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 mb-6 border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-700 mb-4">Add New Department</h2>
                    <form onSubmit={handleAddDepartment} className="flex gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={newDepartment}
                                onChange={(e) => setNewDepartment(e.target.value)}
                                placeholder="Enter department name"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>
                        <button 
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                            disabled={loading}
                        >
                            <Plus className="w-5 h-5" />
                            Add Department
                        </button>
                    </form>
                </div>

                {/* Departments Grid */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                        <h2 className="text-lg font-semibold text-slate-700">All Departments</h2>
                        <p className="text-sm text-slate-500 mt-1">{departments.length} departments total</p>
                    </div>
                    
                    <div className="divide-y divide-slate-100">
                        {departments.map((dept) => (
                            <div 
                                key={dept.dept_id} 
                                className="p-6 hover:bg-slate-50 transition-colors duration-200"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    {/* Department Info */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <span className="text-blue-700 font-bold text-sm">
                                                {dept.dept_id}
                                            </span>
                                        </div>
                                        
                                        {editingId === dept.dept_id ? (
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="flex-1 px-4 py-2 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                autoFocus
                                            />
                                        ) : (
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-slate-800 text-lg">
                                                    {dept.dept_name}
                                                </h3>
                                                <p className="text-slate-500 text-sm">Department ID: {dept.dept_id}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {editingId === dept.dept_id ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdate(dept.dept_id)}
                                                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/30 flex items-center gap-2 font-medium"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-all shadow-md flex items-center gap-2 font-medium"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(dept)}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-md shadow-blue-500/30 flex items-center gap-2 font-medium"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(dept.dept_id)}
                                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md shadow-red-500/30 flex items-center gap-2 font-medium"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {departments.length === 0 && !loading && (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Building2 className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-600 mb-2">No departments yet</h3>
                                <p className="text-slate-500">Add your first department to get started</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Loading Overlay */}
                {loading && (
                    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-slate-700 font-medium">Processing...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}