import { useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const REPORT_TYPES = {
    SCHEDULE: 'schedule',
    MOTOR: 'motor',
    MOTOR_NEW: 'motor_new'
};

const REPORT_OPTIONS = [
    { value: 'date-completed', label: 'Date wise - Completed' },
    { value: 'dept-completed', label: 'Department wise - Completed' },
    { value: 'group-completed', label: 'Group wise - Completed' },
    { value: 'machine-completed', label: 'Machine wise - Completed' },
    { value: 'schedule-completed', label: 'Schedule wise - Completed' },
    { value: 'date-schedule', label: 'Date wise - Schedule' },
    { value: 'dept-schedule', label: 'Department wise - Schedule' },
    { value: 'group-schedule', label: 'Group wise - Schedule' },
    { value: 'machine-schedule', label: 'Machine wise - Schedule' },
    { value: 'schedule-schedule', label: 'Schedule wise - Schedule' }
];

export default function Reports() {
    const [reportType, setReportType] = useState(REPORT_TYPES.SCHEDULE);
    const [fromDate, setFromDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [reportOption, setReportOption] = useState('date-completed');
    const [selectAll, setSelectAll] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerateReport = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await axios.get(`${API_URL}/reports/generate`, {
                params: {
                    type: reportType,
                    fromDate,
                    toDate,
                    reportOption,
                    selectAll
                }
            });

            setReportData(response.data.data);
        } catch (error) {
            setError('Error generating report: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExit = () => {
        window.history.back();
    };

    const renderReportContent = () => {
        if (!reportData) return null;

        const renderTable = () => {
            switch (reportOption) {
                case 'date-completed':
                    return (
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-violet-50 to-fuchsia-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">Department</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">Machine</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">Schedule</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-violet-700 border-b border-violet-200">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-violet-100 bg-white">
                                {reportData.map((item, index) => (
                                    <tr key={index} className="hover:bg-violet-50 transition-colors">
                                        <td className="px-6 py-4 text-violet-700">
                                            {format(new Date(item.date), 'dd-MM-yyyy')}
                                        </td>
                                        <td className="px-6 py-4 text-violet-700">{item.department}</td>
                                        <td className="px-6 py-4 text-violet-700">{item.machine}</td>
                                        <td className="px-6 py-4 text-violet-800 font-semibold">{item.schedule}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    );
                default:
                    return (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-violet-600">Select a report type to view results</p>
                        </div>
                    );
            }
        };

        return (
            <div className="mt-6">
                <div className="bg-white rounded-2xl shadow-xl shadow-violet-200/50 border border-violet-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 border-b border-violet-200">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h2 className="text-lg font-semibold text-violet-700">Report Results</h2>
                        </div>
                        <p className="text-sm text-violet-600 mt-1">{reportData.length} records found</p>
                    </div>
                    
                    <div className="overflow-x-auto">
                        {renderTable()}
                    </div>
                </div>
            </div>
        );
    };

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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-800 to-fuchsia-600 bg-clip-text text-transparent">
                                Reports
                            </h1>
                            <p className="text-violet-600 text-sm">Generate and view detailed reports</p>
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

                {/* Info Banner */}
                <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-blue-700 text-sm">Select report parameters below to generate and view reports.</p>
                    </div>
                </div>

                {/* Report Configuration Form */}
                <div className="bg-white rounded-2xl shadow-xl shadow-violet-200/50 p-6 border border-violet-200">
                    <div className="flex items-center gap-2 mb-6">
                        <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        <h2 className="text-lg font-semibold text-violet-700">Report Configuration</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Report Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-violet-700 mb-3">
                                Report Type <span className="text-red-500">*</span>
                            </label>
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-violet-50" 
                                    style={{ 
                                        borderColor: reportType === REPORT_TYPES.SCHEDULE ? '#7c3aed' : '#e9d5ff',
                                        backgroundColor: reportType === REPORT_TYPES.SCHEDULE ? '#f3e8ff' : 'white'
                                    }}>
                                    <input
                                        type="radio"
                                        checked={reportType === REPORT_TYPES.SCHEDULE}
                                        onChange={() => setReportType(REPORT_TYPES.SCHEDULE)}
                                        className="w-5 h-5 text-violet-600 border-violet-300 focus:ring-2 focus:ring-violet-500 mr-3"
                                    />
                                    <span className="font-medium text-violet-700">Schedule</span>
                                </label>
                                <label className="flex items-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-violet-50"
                                    style={{ 
                                        borderColor: reportType === REPORT_TYPES.MOTOR ? '#7c3aed' : '#e9d5ff',
                                        backgroundColor: reportType === REPORT_TYPES.MOTOR ? '#f3e8ff' : 'white'
                                    }}>
                                    <input
                                        type="radio"
                                        checked={reportType === REPORT_TYPES.MOTOR}
                                        onChange={() => setReportType(REPORT_TYPES.MOTOR)}
                                        className="w-5 h-5 text-violet-600 border-violet-300 focus:ring-2 focus:ring-violet-500 mr-3"
                                    />
                                    <span className="font-medium text-violet-700">Motor</span>
                                </label>
                                <label className="flex items-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-violet-50"
                                    style={{ 
                                        borderColor: reportType === REPORT_TYPES.MOTOR_NEW ? '#7c3aed' : '#e9d5ff',
                                        backgroundColor: reportType === REPORT_TYPES.MOTOR_NEW ? '#f3e8ff' : 'white'
                                    }}>
                                    <input
                                        type="radio"
                                        checked={reportType === REPORT_TYPES.MOTOR_NEW}
                                        onChange={() => setReportType(REPORT_TYPES.MOTOR_NEW)}
                                        className="w-5 h-5 text-violet-600 border-violet-300 focus:ring-2 focus:ring-violet-500 mr-3"
                                    />
                                    <span className="font-medium text-violet-700">Motor New</span>
                                </label>
                            </div>
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-violet-700 mb-2 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    From Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-violet-700 mb-2 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    To Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Report Option */}
                        <div>
                            <label className="block text-sm font-medium text-violet-700 mb-2">
                                Select Report <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={reportOption}
                                onChange={(e) => setReportOption(e.target.value)}
                                className="w-full px-4 py-2.5 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                            >
                                {REPORT_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Select All Checkbox */}
                        <div>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={(e) => setSelectAll(e.target.checked)}
                                    className="w-5 h-5 text-violet-600 border-violet-300 rounded focus:ring-2 focus:ring-violet-500"
                                />
                                <span className="text-sm font-medium text-violet-700 group-hover:text-violet-800">Select All Records</span>
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-violet-200">
                            <button
                                onClick={handleExit}
                                className="px-6 py-3 bg-slate-500 text-white rounded-xl hover:bg-slate-600 transition-all shadow-md flex items-center gap-2 font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Exit
                            </button>
                            <button
                                onClick={handleGenerateReport}
                                disabled={loading}
                                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-700 hover:to-fuchsia-700 shadow-lg shadow-violet-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Generate Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="mt-6 bg-white rounded-2xl shadow-xl shadow-violet-200/50 border border-violet-200 p-12">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-violet-700 font-medium">Generating report...</p>
                        </div>
                    </div>
                )}

                {/* Report Results */}
                {!loading && renderReportContent()}

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