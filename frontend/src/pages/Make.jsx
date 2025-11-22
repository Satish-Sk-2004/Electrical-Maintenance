import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Save, X, Car, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Make() {
    const navigate = useNavigate();
    const [makes, setMakes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newMake, setNewMake] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const fetchMakes = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/makes`);
            if (response.data.success) {
                setMakes(response.data.data);
            }
        } catch (error) {
            setError('Error fetching makes: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMakes();
    }, []);

    const handleAddMake = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await axios.post(`${API_URL}/makes`, {
                make_name: newMake
            });
            setNewMake('');
            fetchMakes();
        } catch (error) {
            setError('Error adding make: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (make) => {
        setEditingId(make.make_id);
        setEditName(make.make_name);
    };

    const handleUpdate = async (id) => {
        try {
            setLoading(true);
            await axios.put(`${API_URL}/makes/${id}`, {
                make_name: editName
            });
            setEditingId(null);
            fetchMakes();
        } catch (error) {
            setError('Error updating make: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this make?')) return;
        
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/makes/${id}`);
            fetchMakes();
        } catch (error) {
            setError('Error deleting make: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 px-4 py-2 text-emerald-600 hover:text-emerald-800 hover:bg-white rounded-lg transition-all group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back</span>
                </button>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Car className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-800 to-teal-600 bg-clip-text text-transparent">
                                Makes Management
                            </h1>
                            <p className="text-emerald-600 text-sm">Manage vehicle makes and brands</p>
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

                {/* Add Make Form */}
                <div className="bg-white rounded-2xl shadow-xl shadow-emerald-200/50 p-6 mb-6 border border-emerald-200">
                    <h2 className="text-lg font-semibold text-emerald-700 mb-4">Add New Make</h2>
                    <form onSubmit={handleAddMake} className="flex gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={newMake}
                                onChange={(e) => setNewMake(e.target.value)}
                                placeholder="Enter make name"
                                className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>
                        <button 
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                            disabled={loading}
                        >
                            <Plus className="w-5 h-5" />
                            Add Make
                        </button>
                    </form>
                </div>

                {/* Makes Grid */}
                <div className="bg-white rounded-2xl shadow-xl shadow-emerald-200/50 border border-emerald-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200">
                        <h2 className="text-lg font-semibold text-emerald-700">All Makes</h2>
                        <p className="text-sm text-emerald-600 mt-1">{makes.length} makes total</p>
                    </div>
                    
                    <div className="divide-y divide-emerald-100">
                        {makes.map((make) => (
                            <div 
                                key={make.make_id} 
                                className="p-6 hover:bg-emerald-50 transition-colors duration-200"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    {/* Make Info */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <span className="text-emerald-700 font-bold text-sm">
                                                {make.make_id}
                                            </span>
                                        </div>
                                        
                                        {editingId === make.make_id ? (
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="flex-1 px-4 py-2 border-2 border-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                                autoFocus
                                            />
                                        ) : (
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-emerald-800 text-lg">
                                                    {make.make_name}
                                                </h3>
                                                <p className="text-emerald-600 text-sm">Make ID: {make.make_id}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {editingId === make.make_id ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdate(make.make_id)}
                                                    className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all shadow-md shadow-teal-500/30 flex items-center gap-2 font-medium"
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
                                                    onClick={() => handleEdit(make)}
                                                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/30 flex items-center gap-2 font-medium"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(make.make_id)}
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
                        
                        {makes.length === 0 && !loading && (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Car className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-emerald-600 mb-2">No makes yet</h3>
                                <p className="text-emerald-500">Add your first make to get started</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Loading Overlay */}
                {loading && (
                    <div className="fixed inset-0 bg-emerald-900/20 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-emerald-700 font-medium">Processing...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}