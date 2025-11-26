import { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, AlertCircle, CheckCircle2, Calendar, Filter } from 'lucide-react';
import jsPDF from 'jspdf';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Reports() {
    const [reportType, setReportType] = useState('date-wise-completed');
    const [departments, setDepartments] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [filters, setFilters] = useState({
        dept_id: '',
        schedule_id: '',
        start_date: '',
        end_date: ''
    });

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [deptsRes, schedulesRes] = await Promise.all([
                axios.get(`${API_URL}/departments`),
                axios.get(`${API_URL}/schedules`)
            ]);

            setDepartments(deptsRes.data.data);
            setSchedules(schedulesRes.data.data);
        } catch (error) {
            setError('Error fetching data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const generateReport = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!filters.end_date) {
                setError('Please select end date');
                setLoading(false);
                return;
            }

            let endpoint = '';
            if (reportType === 'date-wise-completed') {
                endpoint = '/reports/date-wise-completion';
            } else if (reportType === 'machine-wise-completed') {
                endpoint = '/reports/machine-wise-completion';
            } else if (reportType === 'schedule-wise-completed') {
                endpoint = '/reports/schedule-wise-completion';
            } else if (reportType === 'motor-wise-completed') {
                endpoint = '/reports/motor-wise-completion';
            } else if (reportType === 'date-wise-pending') {
                endpoint = '/reports/date-wise-pending';
            } else if (reportType === 'machine-wise-pending') {
                endpoint = '/reports/machine-wise-pending';
            } else if (reportType === 'schedule-wise-pending') {
                endpoint = '/reports/schedule-wise-pending';
            } else if (reportType === 'motor-wise-pending') {
                endpoint = '/reports/motor-wise-pending';
            }

            const params = {
                end_date: filters.end_date,
                dept_id: filters.dept_id || null,
                schedule_id: filters.schedule_id || null
            };

            // Add start_date for completed reports
            if (reportType.includes('completed')) {
                if (!filters.start_date) {
                    setError('Please select start date for completed reports');
                    setLoading(false);
                    return;
                }
                params.start_date = filters.start_date;
            }

            const response = await axios.get(`${API_URL}${endpoint}`, { params });
            setReportData(response.data.data);
            setSuccess('Report generated successfully');
        } catch (error) {
            setError('Error generating report: ' + error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        if (reportData.length === 0) {
            setError('No data to download');
            return;
        }

        try {
            const doc = new jsPDF('l', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            let yPosition = 30;

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('KAYAAR EXPORT PRIVATE LIMITED.,', pageWidth / 2, 15, { align: 'center' });

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const endDate = formatDate(filters.end_date);
            const startDate = filters.start_date ? formatDate(filters.start_date) : '';

            let reportTitle = '';
            if (reportType.includes('completed')) {
                reportTitle = `Motor Schedule Completed - Electrical Maintenance Report From ${startDate} To ${endDate}`;
            } else {
                reportTitle = `Motor Schedule Pending - Electrical Maintenance Report on ${endDate}`;
            }

            doc.text(reportTitle, pageWidth / 2, 22, { align: 'center' });

            doc.setLineWidth(0.5);
            doc.line(10, 25, pageWidth - 10, 25);

            const groupedData = groupReportData();

            const isPending = reportType.includes('pending');
            const columns = isPending
                ? ['Schedule Name', 'Motor Id', 'Freq', 'Machine', 'Last Service Date', 'Last Due Date', 'Missed Cycle', 'Delay']
                : ['Schedule Name', 'Freq', 'Motor Id', 'Machine', 'Sdi. Date', 'Serv.Date', 'Delay'];
            
            const colWidths = isPending
                ? [35, 25, 15, 25, 22, 22, 18, 18]
                : [40, 15, 25, 25, 22, 22, 20];

            const cellHeight = 6;
            const fontSize = 8;
            const lineSpacing = 0.5;

            doc.setFontSize(fontSize);

            Object.keys(groupedData).forEach((groupName, groupIndex) => {
                if (yPosition + cellHeight > pageHeight - 15) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFillColor(200, 200, 200);
                doc.setFont('helvetica', 'bold');
                doc.rect(10, yPosition, pageWidth - 20, cellHeight, 'F');
                doc.text(groupName, 12, yPosition + 4);
                yPosition += cellHeight;

                doc.setFillColor(230, 230, 230);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 0, 0);
                let xPosition = 10;
                columns.forEach((col, colIndex) => {
                    const colWidth = colWidths[colIndex];
                    doc.rect(xPosition, yPosition, colWidth, cellHeight);
                    const textLines = doc.splitTextToSize(col, colWidth - 2);
                    doc.text(textLines, xPosition + 1, yPosition + 3, { maxWidth: colWidth - 2 });
                    xPosition += colWidth;
                });
                yPosition += cellHeight + lineSpacing;

                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                groupedData[groupName].forEach((item, rowIndex) => {
                    if (yPosition + cellHeight > pageHeight - 15) {
                        doc.setFontSize(8);
                        doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
                        doc.addPage();
                        yPosition = 20;
                        doc.setFontSize(fontSize);
                    }

                    let rowData = [];
                    if (isPending) {
                        rowData = [
                            item.schedule_name || '',
                            item.motor_id || '',
                            item.frequency || '',
                            item.machine_number || '',
                            formatDate(item.last_service_date),
                            formatDate(item.last_due_date),
                            item.missed_cycle || '0',
                            item.delay || '0'
                        ];
                    } else {
                        rowData = [
                            item.schedule_name || '',
                            item.frequency || '',
                            item.motor_id || '',
                            item.machine_number || '',
                            formatDate(item.last_service_date),
                            formatDate(item.service_date),
                            item.delay || ''
                        ];
                    }

                    if (rowIndex % 2 === 0) {
                        doc.setFillColor(245, 245, 245);
                    } else {
                        doc.setFillColor(255, 255, 255);
                    }

                    xPosition = 10;
                    rowData.forEach((cell, colIndex) => {
                        const colWidth = colWidths[colIndex];
                        doc.rect(xPosition, yPosition, colWidth, cellHeight, 'F');
                        doc.rect(xPosition, yPosition, colWidth, cellHeight);

                        const cellText = String(cell);
                        const isNumber = !isNaN(cellText) && cellText.trim() !== '';

                        doc.text(cellText, xPosition + 2, yPosition + 4, {
                            maxWidth: colWidth - 3,
                            align: isNumber ? 'right' : 'left'
                        });

                        xPosition += colWidth;
                    });
                    yPosition += cellHeight + lineSpacing;
                });

                yPosition += 3;

                if (groupIndex < Object.keys(groupedData).length - 1) {
                    doc.setDrawColor(150, 150, 150);
                    doc.setLineDash([2, 2]);
                    doc.line(10, yPosition, pageWidth - 10, yPosition);
                    doc.setLineDash([]);
                    yPosition += 3;
                }
            });

            doc.setFontSize(8);
            doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

            const reportName = `${reportType}_${filters.end_date}`;
            doc.save(`${reportName}.pdf`);
            setSuccess('PDF downloaded successfully');
        } catch (error) {
            console.error('PDF generation error:', error);
            setError('Error generating PDF: ' + error.message);
        }
    };

    const groupReportData = () => {
        const grouped = {};

        if (reportType === 'date-wise-completed' || reportType === 'date-wise-pending') {
            reportData.forEach(item => {
                const date = reportType === 'date-wise-completed'
                    ? formatDate(item.last_service_date)
                    : formatDate(item.last_due_date);
                if (!grouped[date]) grouped[date] = [];
                grouped[date].push(item);
            });
        } else if (reportType === 'machine-wise-completed' || reportType === 'machine-wise-pending') {
            reportData.forEach(item => {
                const machine = item.machine_name || item.machine_number || 'N/A';
                if (!grouped[machine]) grouped[machine] = [];
                grouped[machine].push(item);
            });
        } else if (reportType === 'schedule-wise-completed' || reportType === 'schedule-wise-pending') {
            reportData.forEach(item => {
                const schedule = item.schedule_name || 'N/A';
                if (!grouped[schedule]) grouped[schedule] = [];
                grouped[schedule].push(item);
            });
        } else if (reportType === 'motor-wise-completed' || reportType === 'motor-wise-pending') {
            reportData.forEach(item => {
                const motor = item.motor_id || 'N/A';
                if (!grouped[motor]) grouped[motor] = [];
                grouped[motor].push(item);
            });
        }

        const sortedGroups = {};
        Object.keys(grouped).sort().forEach(key => {
            sortedGroups[key] = grouped[key];
        });

        return sortedGroups;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => window.history.back()}
                    className="mb-6 flex items-center gap-2 px-4 py-2 text-indigo-600 hover:text-indigo-800 hover:bg-white rounded-lg transition-all group"
                >
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">Back</span>
                </button>

                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-800 to-purple-600 bg-clip-text text-transparent">
                                Reports
                            </h1>
                            <p className="text-indigo-600 text-sm">Motor Schedule Reports</p>
                        </div>
                    </div>
                </div>

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

                <div className="bg-white rounded-2xl shadow-xl shadow-indigo-200/50 p-6 mb-6 border border-indigo-200">
                    <h2 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Report Type
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-300">
                            <input
                                type="radio"
                                name="reportType"
                                value="date-wise-completed"
                                checked={reportType === 'date-wise-completed'}
                                onChange={(e) => {
                                    setReportType(e.target.value);
                                    setReportData([]);
                                }}
                                className="w-4 h-4 text-indigo-600"
                            />
                            <div>
                                <span className="text-indigo-700 font-medium text-sm">Date Wise Completed</span>
                                <p className="text-xs text-indigo-500">By Service Date</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-300">
                            <input
                                type="radio"
                                name="reportType"
                                value="machine-wise-completed"
                                checked={reportType === 'machine-wise-completed'}
                                onChange={(e) => {
                                    setReportType(e.target.value);
                                    setReportData([]);
                                }}
                                className="w-4 h-4 text-indigo-600"
                            />
                            <div>
                                <span className="text-indigo-700 font-medium text-sm">Machine Wise Completed</span>
                                <p className="text-xs text-indigo-500">By Machine</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-300">
                            <input
                                type="radio"
                                name="reportType"
                                value="schedule-wise-completed"
                                checked={reportType === 'schedule-wise-completed'}
                                onChange={(e) => {
                                    setReportType(e.target.value);
                                    setReportData([]);
                                }}
                                className="w-4 h-4 text-indigo-600"
                            />
                            <div>
                                <span className="text-indigo-700 font-medium text-sm">Schedule Wise Completed</span>
                                <p className="text-xs text-indigo-500">By Schedule</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-300">
                            <input
                                type="radio"
                                name="reportType"
                                value="motor-wise-completed"
                                checked={reportType === 'motor-wise-completed'}
                                onChange={(e) => {
                                    setReportType(e.target.value);
                                    setReportData([]);
                                }}
                                className="w-4 h-4 text-indigo-600"
                            />
                            <div>
                                <span className="text-indigo-700 font-medium text-sm">Motor Wise Completed</span>
                                <p className="text-xs text-indigo-500">By Motor ID</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-orange-50 border border-transparent hover:border-orange-300">
                            <input
                                type="radio"
                                name="reportType"
                                value="date-wise-pending"
                                checked={reportType === 'date-wise-pending'}
                                onChange={(e) => {
                                    setReportType(e.target.value);
                                    setReportData([]);
                                }}
                                className="w-4 h-4 text-orange-600"
                            />
                            <div>
                                <span className="text-orange-700 font-medium text-sm">Date Wise Pending</span>
                                <p className="text-xs text-orange-500">By Due Date</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-orange-50 border border-transparent hover:border-orange-300">
                            <input
                                type="radio"
                                name="reportType"
                                value="machine-wise-pending"
                                checked={reportType === 'machine-wise-pending'}
                                onChange={(e) => {
                                    setReportType(e.target.value);
                                    setReportData([]);
                                }}
                                className="w-4 h-4 text-orange-600"
                            />
                            <div>
                                <span className="text-orange-700 font-medium text-sm">Machine Wise Pending</span>
                                <p className="text-xs text-orange-500">By Machine</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-orange-50 border border-transparent hover:border-orange-300">
                            <input
                                type="radio"
                                name="reportType"
                                value="schedule-wise-pending"
                                checked={reportType === 'schedule-wise-pending'}
                                onChange={(e) => {
                                    setReportType(e.target.value);
                                    setReportData([]);
                                }}
                                className="w-4 h-4 text-orange-600"
                            />
                            <div>
                                <span className="text-orange-700 font-medium text-sm">Schedule Wise Pending</span>
                                <p className="text-xs text-orange-500">By Schedule</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-orange-50 border border-transparent hover:border-orange-300">
                            <input
                                type="radio"
                                name="reportType"
                                value="motor-wise-pending"
                                checked={reportType === 'motor-wise-pending'}
                                onChange={(e) => {
                                    setReportType(e.target.value);
                                    setReportData([]);
                                }}
                                className="w-4 h-4 text-orange-600"
                            />
                            <div>
                                <span className="text-orange-700 font-medium text-sm">Motor Wise Pending</span>
                                <p className="text-xs text-orange-500">By Motor ID</p>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-indigo-200/50 p-6 mb-6 border border-indigo-200">
                    <h2 className="text-lg font-semibold text-indigo-700 mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Filters
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {reportType.includes('completed') && (
                            <div>
                                <label className="block text-sm font-medium text-indigo-700 mb-2">
                                    Start Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={filters.start_date}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-indigo-700 mb-2">
                                End Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="end_date"
                                value={filters.end_date}
                                onChange={handleFilterChange}
                                className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-indigo-700 mb-2">
                                Department (Optional)
                            </label>
                            <select
                                name="dept_id"
                                value={filters.dept_id}
                                onChange={handleFilterChange}
                                className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                            <label className="block text-sm font-medium text-indigo-700 mb-2">
                                Schedule (Optional)
                            </label>
                            <select
                                name="schedule_id"
                                value={filters.schedule_id}
                                onChange={handleFilterChange}
                                className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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

                    <button
                        onClick={generateReport}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Generate Report
                    </button>
                </div>

                {reportData.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl shadow-indigo-200/50 border border-indigo-200 overflow-hidden mb-6">
                        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-indigo-700">Report Results</h2>
                            <button
                                onClick={downloadPDF}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-md shadow-green-500/30 flex items-center gap-2 font-medium text-sm"
                            >
                                <Download className="w-4 h-4" />
                                Download PDF
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 sticky top-0">
                                    <tr>
                                        {reportType.includes('pending') ? (
                                            <>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Schedule Name</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Motor ID</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Frequency</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Machine</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Last Service Date</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Last Due Date</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Missed Cycle</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Delay (Days)</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Schedule Name</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Frequency</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Motor ID</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Machine</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Sdi. Date</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Serv. Date</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700 border-b border-indigo-200">Delay (Days)</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-indigo-100">
                                    {reportData.map((item, index) => (
                                        <tr key={index} className="hover:bg-indigo-50 transition-colors">
                                            {reportType.includes('pending') ? (
                                                <>
                                                    <td className="px-6 py-4 text-indigo-700">{item.schedule_name}</td>
                                                    <td className="px-6 py-4 text-indigo-700 font-mono">{item.motor_id}</td>
                                                    <td className="px-6 py-4 text-indigo-700 font-medium">{item.frequency}</td>
                                                    <td className="px-6 py-4 text-indigo-700">{item.machine_number}</td>
                                                    <td className="px-6 py-4 text-indigo-700">{formatDate(item.last_service_date)}</td>
                                                    <td className="px-6 py-4 text-indigo-700">{formatDate(item.last_due_date)}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                                            {item.missed_cycle || '0'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-orange-600">{item.delay}</span>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-6 py-4 text-indigo-700">{item.schedule_name}</td>
                                                    <td className="px-6 py-4 text-indigo-700 font-medium">{item.frequency}</td>
                                                    <td className="px-6 py-4 text-indigo-700 font-mono">{item.motor_id}</td>
                                                    <td className="px-6 py-4 text-indigo-700">{item.machine_number}</td>
                                                    <td className="px-6 py-4 text-indigo-700">{formatDate(item.last_service_date)}</td>
                                                    <td className="px-6 py-4 text-indigo-700">{formatDate(item.service_date)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`font-bold ${item.delay > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                            {item.delay}
                                                        </span>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-indigo-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-indigo-100 rounded-lg p-4">
                                    <p className="text-indigo-700 text-sm font-medium">Total Records</p>
                                    <p className="text-2xl font-bold text-indigo-800">{reportData.length}</p>
                                </div>
                                {reportType.includes('completed') ? (
                                    <>
                                        <div className="bg-green-100 rounded-lg p-4">
                                            <p className="text-green-700 text-sm font-medium">On Time (Delay {'<='} 0)</p>
                                            <p className="text-2xl font-bold text-green-800">
                                                {reportData.filter(r => r.delay <= 0).length}
                                            </p>
                                        </div>
                                        <div className="bg-red-100 rounded-lg p-4">
                                            <p className="text-red-700 text-sm font-medium">Delayed (Delay {'>'} 0)</p>
                                            <p className="text-2xl font-bold text-red-800">
                                                {reportData.filter(r => r.delay > 0).length}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-orange-100 rounded-lg p-4">
                                            <p className="text-orange-700 text-sm font-medium">Avg Delay</p>
                                            <p className="text-2xl font-bold text-orange-800">
                                                {reportData.length > 0 
                                                    ? Math.round(reportData.reduce((sum, r) => sum + r.delay, 0) / reportData.length)
                                                    : 0
                                                } days
                                            </p>
                                        </div>
                                        <div className="bg-yellow-100 rounded-lg p-4">
                                            <p className="text-yellow-700 text-sm font-medium">Total Missed Cycles</p>
                                            <p className="text-2xl font-bold text-yellow-800">
                                                {reportData.reduce((sum, r) => sum + (parseInt(r.missed_cycle) || 0), 0)}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="fixed inset-0 bg-indigo-900/20 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-indigo-700 font-medium">Generating report...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}