import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Save, X, Briefcase, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function WorkType() {
    const navigate = useNavigate();
    const [workTypes, setWorkTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newWorkType, setNewWorkType] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const fetchWorkTypes = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/worktypes`);
            if (response.data.success) {
                setWorkTypes(response.data.data);
            }
        } catch (error) {
            setError('Error fetching work types: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkTypes();
    }, []);

    const handleAddWorkType = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await axios.post(`${API_URL}/worktypes`, {
                work_type: newWorkType
            });
            setNewWorkType('');
            fetchWorkTypes();
        } catch (error) {
            setError('Error adding work type: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (workType) => {
        setEditingId(workType.work_id);
        setEditName(workType.work_type);
    };

    const handleUpdate = async (id) => {
        try {
            setLoading(true);
            await axios.put(`${API_URL}/worktypes/${id}`, {
                work_type: editName
            });
            setEditingId(null);
            fetchWorkTypes();
        } catch (error) {
            setError('Error updating work type: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this work type?')) return;
        
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/worktypes/${id}`);
            fetchWorkTypes();
        } catch (error) {
            setError('Error deleting work type: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 px-4 py-2 text-cyan-600 hover:text-cyan-800 hover:bg-white rounded-lg transition-all group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back</span>
                </button>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-800 to-blue-600 bg-clip-text text-transparent">
                                Work Types Management
                            </h1>
                            <p className="text-cyan-600 text-sm">Define and manage work categories</p>
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

                {/* Add Work Type Form */}
                <div className="bg-white rounded-2xl shadow-xl shadow-cyan-200/50 p-6 mb-6 border border-cyan-200">
                    <h2 className="text-lg font-semibold text-cyan-700 mb-4">Add New Work Type</h2>
                    <form onSubmit={handleAddWorkType} className="flex gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={newWorkType}
                                onChange={(e) => setNewWorkType(e.target.value)}
                                placeholder="Enter work type name"
                                className="w-full px-4 py-3 border border-cyan-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>
                        <button 
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                            disabled={loading}
                        >
                            <Plus className="w-5 h-5" />
                            Add Work Type
                        </button>
                    </form>
                </div>

                {/* Work Types Grid */}
                <div className="bg-white rounded-2xl shadow-xl shadow-cyan-200/50 border border-cyan-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-200">
                        <h2 className="text-lg font-semibold text-cyan-700">All Work Types</h2>
                        <p className="text-sm text-cyan-600 mt-1">{workTypes.length} work types total</p>
                    </div>
                    
                    <div className="divide-y divide-cyan-100">
                        {workTypes.map((workType) => (
                            <div 
                                key={workType.work_id} 
                                className="p-6 hover:bg-cyan-50 transition-colors duration-200"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    {/* Work Type Info */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <span className="text-cyan-700 font-bold text-sm">
                                                {workType.work_id}
                                            </span>
                                        </div>
                                        
                                        {editingId === workType.work_id ? (
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="flex-1 px-4 py-2 border-2 border-cyan-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300"
                                                autoFocus
                                            />
                                        ) : (
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-cyan-800 text-lg">
                                                    {workType.work_type}
                                                </h3>
                                                <p className="text-cyan-600 text-sm">Work Type ID: {workType.work_id}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {editingId === workType.work_id ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdate(workType.work_id)}
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
                                                    onClick={() => handleEdit(workType)}
                                                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all shadow-md shadow-cyan-500/30 flex items-center gap-2 font-medium"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(workType.work_id)}
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
                        
                        {workTypes.length === 0 && !loading && (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Briefcase className="w-8 h-8 text-cyan-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-cyan-600 mb-2">No work types yet</h3>
                                <p className="text-cyan-500">Add your first work type to get started</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Loading Overlay */}
                {loading && (
                    <div className="fixed inset-0 bg-cyan-900/20 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-cyan-700 font-medium">Processing...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}