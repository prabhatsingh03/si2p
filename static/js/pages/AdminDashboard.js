import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { Redirect } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { FormConfigContext } from '../context/FormConfigContext'; // Assuming this context is extracted
import { DashboardLayout } from '../components/DashboardLayout';
import MultiSelectDropdown from '../components/MultiSelectDropdown';
import SkeletonRow from '../components/SkeletonRow';
// Import modals (placeholder paths, assuming they will be extracted to components)
// import CommentModal from '../components/CommentModal';
// import ViewIdeaModal from '../components/ViewIdeaModal';
// import EditIdeaModal from '../components/EditIdeaModal';
// import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

// Chart.js is assumed to be loaded via CDN as per original index.html or needs to be installed via npm.
// Since user instructions said "Refactor Static Assets", assuming we keep using global Chart or existing setup.
// However, in a React app, we usually use react-chartjs-2.
// For this refactor, I will assume Chart is available globally or I should import it if I install it.
// The code uses `new Chart(ctx, ...)`, so it expects Chart to be in scope.
// If extracted, we might need `import Chart from 'chart.js/auto';` if using npm, or ensure it's on window.
// Given strict adherence to "Refactor", I will keep `new Chart` but might need to ensure access.
// Ideally, I should add `import Chart from 'chart.js/auto';` if I was setting up a full build process.
// But if this is just splitting files for a script tag load validation, `Chart` might be global.
// I will assuming `window.Chart` or just `Chart` if it's GLOBAL.
// Safe bet: usage of `window.Chart` if not imported. Or add a comment.
// Code snippet used `new Chart`.

const AdminDashboard = () => {
    const { user, fetchWithAuth } = useContext(AuthContext);
    const { formConfig } = useContext(FormConfigContext);
    const [filteredIdeas, setFilteredIdeas] = useState([]);
    const [updatingId, setUpdatingId] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        category: '',
        company: '',
        startDate: '',
        endDate: ''
    });
    const [isLoading, setIsLoading] = useState(true);

    const [commentModalIdeaId, setCommentModalIdeaId] = useState(null);

    // Modal states for View, Edit, Delete
    const [viewModalIdea, setViewModalIdea] = useState(null);
    const [editModalIdea, setEditModalIdea] = useState(null);
    const [deleteModalIdea, setDeleteModalIdea] = useState(null);

    // State and options for the chart selector dropdown
    const chartOptions = {
        'status': 'Ideas by Status',
        'company': 'Ideas by department',
        'category': 'Ideas by category ',
        'department': 'Ideas by Department impacted'
    };
    const [selectedCharts, setSelectedCharts] = useState(['status', 'company']);

    // Refs for all four charts
    const statusPieChartRef = useRef(null);
    const companyBarChartRef = useRef(null);
    const categoryPieChartRef = useRef(null);
    const departmentBarChartRef = useRef(null);

    const statusPieChartInstance = useRef(null);
    const companyBarChartInstance = useRef(null);
    const categoryPieChartInstance = useRef(null);
    const departmentBarChartInstance = useRef(null);

    // Define a professional color palette
    const colorPalette = {
        blue: '#3b82f6',
        red: '#ef4444',
        yellow: '#f59e0b',
        green: '#22c55e',
        purple: '#8b5cf6',
        teal: '#14b8a6',
        pink: '#ec4899',
        orange: '#f97316'
    };

    const pieColors1 = [colorPalette.blue, colorPalette.yellow, colorPalette.green, colorPalette.purple, colorPalette.orange, colorPalette.pink];
    const pieColors2 = [colorPalette.teal, colorPalette.red, colorPalette.blue];


    // Effect to fetch ideas based on filters
    useEffect(() => {
        const fetchFilteredIdeas = async () => {
            setIsLoading(true);
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(filters)) {
                if (value) {
                    params.append(key, value);
                }
            }

            try {
                const response = await fetchWithAuth(`${window.API_BASE_URL}/ideas?${params.toString()}`);
                if (response.ok) {
                    const data = await response.json();
                    setFilteredIdeas(data);
                } else {
                    console.error("Failed to fetch filtered ideas");
                }
            } catch (error) {
                console.error("Error fetching ideas:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFilteredIdeas();
    }, [filters, fetchWithAuth]);

    // Effect to update charts when idea data or chart selection changes
    useEffect(() => {
        // Determine Chart Colors and Fonts
        const fontFamily = "'Inter', sans-serif";
        const tooltipStyle = {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#111827',
            titleFont: { family: fontFamily, size: 13, weight: '700' },
            bodyColor: '#4b5563',
            bodyFont: { family: fontFamily, size: 12 },
            borderColor: '#f3f4f6',
            borderWidth: 1,
            padding: 12,
            boxPadding: 4,
            usePointStyle: true,
            cornerRadius: 8,
            displayColors: true,
        };

        const legendStyle = {
            labels: {
                font: { family: fontFamily, size: 12, weight: '600' },
                color: '#6b7280',
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 20
            },
            position: 'bottom'
        };

        const gridStyle = {
            color: '#f3f4f6',
            borderDash: [5, 5],
            drawBorder: false,
        };

        // Helper to safely destroy chart instances
        const destroyChart = (instanceRef) => {
            if (instanceRef.current) {
                instanceRef.current.destroy();
                instanceRef.current = null;
            }
        };

        const Chart = window.Chart; // Access global Chart object

        if (!Chart) return; // Guard if Chart is not loaded

        // --- 1. Status Pie Chart ---
        destroyChart(statusPieChartInstance);
        if (selectedCharts.includes('status')) {
            const statusCounts = filteredIdeas.reduce((acc, idea) => {
                acc[idea.status] = (acc[idea.status] || 0) + 1;
                return acc;
            }, {});

            if (statusPieChartRef.current && Object.keys(statusCounts).length > 0) {
                const ctx = statusPieChartRef.current.getContext('2d');
                statusPieChartInstance.current = new Chart(ctx, {
                    type: 'doughnut', // Upgrade to Doughnut for modern look
                    data: {
                        labels: Object.keys(statusCounts),
                        datasets: [{
                            label: 'Ideas',
                            data: Object.values(statusCounts),
                            backgroundColor: pieColors1,
                            borderColor: '#ffffff',
                            borderWidth: 2,
                            hoverOffset: 12,
                            borderRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '65%', // Thinner ring
                        plugins: {
                            legend: legendStyle,
                            title: { display: false },
                            tooltip: tooltipStyle
                        },
                        animation: {
                            animateScale: true,
                            animateRotate: true
                        }
                    }
                });
            }
        }

        // --- 2. Company Bar Chart ---
        destroyChart(companyBarChartInstance);
        if (selectedCharts.includes('company')) {
            const companyCounts = filteredIdeas.reduce((acc, idea) => {
                acc[idea.company] = (acc[idea.company] || 0) + 1;
                return acc;
            }, {});

            if (companyBarChartRef.current && Object.keys(companyCounts).length > 0) {
                const ctx = companyBarChartRef.current.getContext('2d');
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, '#2dd4bf'); // teal-400
                gradient.addColorStop(1, '#0d9488'); // teal-600

                companyBarChartInstance.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: Object.keys(companyCounts),
                        datasets: [{
                            label: 'Number of Ideas',
                            data: Object.values(companyCounts),
                            backgroundColor: gradient,
                            borderRadius: 8,
                            barPercentage: 0.6,
                            categoryPercentage: 0.7
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            title: { display: false },
                            tooltip: tooltipStyle
                        },
                        scales: {
                            x: {
                                grid: { display: false },
                                ticks: { font: { family: fontFamily }, color: '#9ca3af' }
                            },
                            y: {
                                beginAtZero: true,
                                ticks: { stepSize: 1, font: { family: fontFamily }, color: '#9ca3af' },
                                grid: gridStyle,
                                border: { display: false }
                            }
                        }
                    }
                });
            }
        }

        // --- 3. Category Pie Chart ---
        destroyChart(categoryPieChartInstance);
        if (selectedCharts.includes('category')) {
            const categoryCounts = filteredIdeas.reduce((acc, idea) => {
                if (idea.ideaCategory) { acc[idea.ideaCategory] = (acc[idea.ideaCategory] || 0) + 1; }
                return acc;
            }, {});

            if (categoryPieChartRef.current && Object.keys(categoryCounts).length > 0) {
                const ctx = categoryPieChartRef.current.getContext('2d');
                categoryPieChartInstance.current = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: Object.keys(categoryCounts),
                        datasets: [{
                            data: Object.values(categoryCounts),
                            backgroundColor: pieColors2,
                            borderColor: '#ffffff',
                            borderWidth: 2,
                            hoverOffset: 12,
                            borderRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '65%',
                        plugins: {
                            legend: legendStyle,
                            title: { display: false },
                            tooltip: tooltipStyle
                        },
                    }
                });
            }
        }

        // --- 4. Department Bar Chart ---
        destroyChart(departmentBarChartInstance);
        if (selectedCharts.includes('department')) {
            const departmentOptions = formConfig.find(f => f.name === 'departmentsImpacted')?.options || [];
            const departmentCounts = departmentOptions.reduce((acc, dept) => ({ ...acc, [dept]: 0 }), {});

            filteredIdeas.forEach(idea => {
                const departments = idea.departmentsImpacted;
                if (Array.isArray(departments)) {
                    departments.forEach(dept => {
                        if (departmentCounts.hasOwnProperty(dept)) departmentCounts[dept]++;
                    });
                } else if (typeof departments === 'string' && departmentCounts.hasOwnProperty(departments)) {
                    departmentCounts[departments]++;
                }
            });

            if (departmentBarChartRef.current && Object.keys(departmentCounts).length > 0) {
                const ctx = departmentBarChartRef.current.getContext('2d');
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, '#a78bfa'); // violet-400
                gradient.addColorStop(1, '#7c3aed'); // violet-600

                departmentBarChartInstance.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: Object.keys(departmentCounts),
                        datasets: [{
                            label: 'Number of Ideas',
                            data: Object.values(departmentCounts),
                            backgroundColor: gradient,
                            borderRadius: 8,
                            barPercentage: 0.6,
                            categoryPercentage: 0.7
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            title: { display: false },
                            tooltip: tooltipStyle
                        },
                        scales: {
                            x: {
                                grid: { display: false },
                                ticks: { font: { family: fontFamily }, color: '#9ca3af' }
                            },
                            y: {
                                beginAtZero: true,
                                ticks: { stepSize: 1, font: { family: fontFamily }, color: '#9ca3af' },
                                grid: gridStyle,
                                border: { display: false }
                            }
                        }
                    }
                });
            }
        }

        // Cleanup on unmount or re-render
        return () => {
            destroyChart(statusPieChartInstance);
            destroyChart(companyBarChartInstance);
            destroyChart(categoryPieChartInstance);
            destroyChart(departmentBarChartInstance);
        };
    }, [filteredIdeas, formConfig, selectedCharts]);


    const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleStatusChange = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            // Optimized immediate update
            const payload = {
                updates: [{ id: id, status: newStatus }]
            };

            const response = await fetchWithAuth(`${window.API_BASE_URL}/ideas/update-status`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // Update local state to reflect change immediately
                setFilteredIdeas(prev => prev.map(idea =>
                    idea.id === id ? { ...idea, status: newStatus } : idea
                ));
            } else {
                alert('Failed to update status. Please try again.');
                // Revert change by refreshing list
                setFilters(current => ({ ...current }));
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('An error occurred while updating status.');
        } finally {
            setUpdatingId(null);
        }
    };



    const downloadCSV = () => {
        const headers = ["ID", "Title", "Submitter", "Company", "Category", "Status", "Submission Date"];
        const rows = filteredIdeas.map(idea => [idea.id, `"${idea.ideaTitle.replace(/"/g, '""')}"`, idea.employeeName, idea.company, idea.ideaCategory, idea.status, new Date(idea.submissionDate).toLocaleDateString()].join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', 'ideas_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Handler functions for View, Edit, Delete
    const handleViewIdea = (idea) => {
        setViewModalIdea(idea);
    };

    const handleEditIdea = (idea) => {
        setEditModalIdea(idea);
    };

    const handleDeleteIdea = (idea) => {
        setDeleteModalIdea(idea);
    };

    const confirmDelete = async () => {
        if (!deleteModalIdea) return;

        const response = await fetchWithAuth(`${window.API_BASE_URL}/ideas/${deleteModalIdea.id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            setDeleteModalIdea(null);
            // Refresh ideas list
            setFilters(currentFilters => ({ ...currentFilters }));
        } else {
            alert('Failed to delete idea');
        }
    };

    const refreshIdeas = () => {
        setFilters(currentFilters => ({ ...currentFilters }));
    };

    const canDeleteIdea = (idea) => {
        if (user.role === 'superadmin') return true;
        if (user.role === 'admin' && idea.status !== 'Approved' && idea.status !== 'Implemented') return true;
        return false;
    };

    const companyOptions = useMemo(() => {
        const companyField = formConfig.find(field => field.name === 'company');
        return companyField ? companyField.options : [];
    }, [formConfig]);

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return <Redirect to={{ pathname: "/", state: { openLogin: true } }} />;

    if (isLoading) return (
        <DashboardLayout>
            <div className="container mx-auto p-6 max-w-8xl animate-pulse">
                <div className="mb-8 space-y-3">
                    <div className="h-10 bg-gray-200 rounded w-64"></div>
                    <div className="h-6 bg-gray-200 rounded w-96"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-32 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
                            </div>
                            <div className="h-8 bg-gray-200 rounded w-16"></div>
                        </div>
                    ))}
                </div>
                {/* Charts Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-96"></div>
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-96"></div>
                </div>
                {/* Table Skeleton */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <div className="h-6 bg-gray-200 rounded w-48"></div>
                        <div className="h-10 bg-gray-200 rounded w-32"></div>
                    </div>
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                {[...Array(7)].map((_, i) => <th key={i} className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-full"></div></th>)}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            <SkeletonRow cols={7} />
                            <SkeletonRow cols={7} />
                            <SkeletonRow cols={7} />
                            <SkeletonRow cols={7} />
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            {/* 
                TODO: Uncomment and import these modals once they are extracted
                <CommentModal ideaId={commentModalIdeaId} show={!!commentModalIdeaId} onClose={() => setCommentModalIdeaId(null)} />
                <ViewIdeaModal idea={viewModalIdea} show={!!viewModalIdea} onClose={() => setViewModalIdea(null)} />
                <EditIdeaModal idea={editModalIdea} show={!!editModalIdea} onClose={() => setEditModalIdea(null)} onSave={refreshIdeas} />
                <DeleteConfirmationModal idea={deleteModalIdea} show={!!deleteModalIdea} onClose={() => setDeleteModalIdea(null)} onConfirm={confirmDelete} />
            */}
            {/* Temporary placeholders if modals are not yet available */}
            {commentModalIdeaId && window.CommentModal && <window.CommentModal ideaId={commentModalIdeaId} show={!!commentModalIdeaId} onClose={() => setCommentModalIdeaId(null)} />}
            {viewModalIdea && window.ViewIdeaModal && <window.ViewIdeaModal idea={viewModalIdea} show={!!viewModalIdea} onClose={() => setViewModalIdea(null)} />}
            {editModalIdea && window.EditIdeaModal && <window.EditIdeaModal idea={editModalIdea} show={!!editModalIdea} onClose={() => setEditModalIdea(null)} onSave={refreshIdeas} />}
            {deleteModalIdea && window.DeleteConfirmationModal && <window.DeleteConfirmationModal idea={deleteModalIdea} show={!!deleteModalIdea} onClose={() => setDeleteModalIdea(null)} onConfirm={confirmDelete} />}

            <div className="container mx-auto p-6 max-w-8xl"> {/* Expanded max-width for premium feel */}
                <div className="mb-8">
                    <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h2>
                    <p className="text-gray-500 mt-2 text-lg">Overview of innovation performance and idea management.</p>
                </div>

                {/* 1. KPI Cards Section (Top) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {/* Total Ideas */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">Total Ideas</p>
                                <p className="text-4xl font-black text-gray-900">{filteredIdeas.length}</p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3.5 rounded-xl shadow-lg shadow-blue-200">
                                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Approved */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-green-600 uppercase tracking-wider mb-1">Approved</p>
                                <p className="text-4xl font-black text-gray-900">{filteredIdeas.filter(i => i.status === 'Approved').length}</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-500 to-green-600 p-3.5 rounded-xl shadow-lg shadow-green-200">
                                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Under Review */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-yellow-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-yellow-600 uppercase tracking-wider mb-1">Under Review</p>
                                <p className="text-4xl font-black text-gray-900">{filteredIdeas.filter(i => i.status === 'Under Review' || i.status === 'Shortlisted').length}</p>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-3.5 rounded-xl shadow-lg shadow-yellow-200">
                                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Approval Rate */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Approval Rate</p>
                                <p className="text-4xl font-black text-gray-900">
                                    {filteredIdeas.length > 0 ? Math.round((filteredIdeas.filter(i => i.status === 'Approved').length / filteredIdeas.length) * 100) : 0}%
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3.5 rounded-xl shadow-lg shadow-purple-200">
                                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Table Section (Premium Card Style) - DIRECTLY BELOW KPI */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-12 animate-fadeIn">
                    {/* Table Filters Header */}
                    <div className="p-6 border-b border-gray-100 bg-gray-50/30">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                </span>
                                All Ideas
                            </h3>
                            <div className="flex items-center gap-3">

                                <button onClick={downloadCSV} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    <span>Export CSV</span>
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </span>
                                <input type="text" name="search" placeholder="Search..." value={filters.search} onChange={handleFilterChange} className="pl-10 p-2.5 bg-white border border-gray-200 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                            </div>
                            <select name="status" value={filters.status} onChange={handleFilterChange} className="p-2.5 bg-white border border-gray-200 rounded-xl w-full focus:ring-2 focus:ring-blue-500 cursor-pointer"><option value="">All Statuses</option>{['Submitted', 'Under Review', 'Shortlisted', 'Approved', 'Rejected', 'Draft'].map(s => <option key={s} value={s}>{s}</option>)}</select>
                            <select name="category" value={filters.category} onChange={handleFilterChange} className="p-2.5 bg-white border border-gray-200 rounded-xl w-full focus:ring-2 focus:ring-blue-500 cursor-pointer"><option value="">All Categories</option>{['AI Leadership / Thought Leadership', 'Productivity Enhancement Tools', 'Optimization'].map(c => <option key={c} value={c}>{c}</option>)}</select>
                            <select name="company" value={filters.company} onChange={handleFilterChange} className="p-2.5 bg-white border border-gray-200 rounded-xl w-full focus:ring-2 focus:ring-blue-500 cursor-pointer">
                                <option value="">All Companies</option>
                                {companyOptions.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {/* Date inputs if needed, can be collapsible */}
                        </div>
                    </div>

                    {/* Main Table */}
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                                <tr>
                                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Submitter</th>
                                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Idea Details</th>
                                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Impact</th>
                                    <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {filteredIdeas.map((idea, index) => {
                                    const deleteAllowed = canDeleteIdea(idea);
                                    const netScore = (idea.likes || 0) - (idea.dislikes || 0);
                                    const isUpdating = updatingId === idea.id;

                                    return (
                                        <tr key={idea.id} className="group hover:bg-blue-50/30 transition-all duration-200 hover:scale-[1.002]">
                                            <td className="py-4 px-6 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-xs border border-blue-200 shadow-sm">
                                                        {idea.employeeName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{idea.employeeName}</div>
                                                        <div className="text-xs text-gray-400">{idea.company}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm">
                                                <div className="font-semibold text-gray-900 mb-0.5 max-w-xs truncate" title={idea.ideaTitle}>{idea.ideaTitle}</div>
                                                <div className="text-xs text-gray-500">{new Date(idea.submissionDate).toLocaleDateString()}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                                    {idea.ideaCategory}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className={`text-sm font-bold ${netScore > 0 ? 'text-green-600' : netScore < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                                    {netScore > 0 ? '+' : ''}{netScore}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-0.5">Net Score</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="relative">
                                                    {isUpdating && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                                                            <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <select
                                                        value={idea.status}
                                                        onChange={(e) => handleStatusChange(idea.id, e.target.value)}
                                                        disabled={isUpdating}
                                                        className={`block w-full py-1.5 pl-3 pr-8 text-xs font-bold rounded-lg border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm transition-all ${idea.status === 'Approved' ? 'bg-green-100 text-green-700 ring-1 ring-green-200'
                                                            : idea.status === 'Rejected' ? 'bg-red-50 text-red-700 ring-1 ring-red-100'
                                                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {['Submitted', 'Under Review', 'Shortlisted', 'Approved', 'Rejected', 'Draft'].map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <button onClick={() => handleViewIdea(idea)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </button>
                                                    <button onClick={() => handleEditIdea(idea)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                    <button onClick={() => setCommentModalIdeaId(idea.id)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Comments">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                    </button>
                                                    <button onClick={() => deleteAllowed && handleDeleteIdea(idea)} disabled={!deleteAllowed} className={`p-1.5 rounded-lg transition-colors ${deleteAllowed ? 'text-red-500 hover:bg-red-50' : 'text-gray-300 cursor-not-allowed'}`} title="Delete">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {filteredIdeas.length === 0 && (
                                    <tr><td colSpan="6" className="p-8 text-center text-gray-500 italic">No ideas found matching your filters.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. Charts Section (Bottom) */}
                <div className="mb-12 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">Analytics Overview</h3>
                            <p className="text-gray-500 text-sm">Visual insights into organization performance</p>
                        </div>
                        <div className="w-full md:w-auto mt-4 md:mt-0">
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Customize Dashboard</label>
                            <MultiSelectDropdown
                                options={chartOptions}
                                selectedOptions={selectedCharts}
                                onChange={setSelectedCharts}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {selectedCharts.includes('status') && (
                            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="font-bold text-lg text-gray-800">Ideas by Status</h4>
                                    <div className="bg-blue-50 px-3 py-1 rounded-full text-xs font-bold text-blue-600">Real-time</div>
                                </div>
                                <div className="relative h-64 w-full flex items-center justify-center">
                                    <canvas ref={statusPieChartRef}></canvas>
                                </div>
                            </div>
                        )}
                        {selectedCharts.includes('company') && (
                            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="font-bold text-lg text-gray-800">Participation by department</h4>
                                    <div className="bg-teal-50 px-3 py-1 rounded-full text-xs font-bold text-teal-600">Metric</div>
                                </div>
                                <div className="relative h-64 w-full">
                                    <canvas ref={companyBarChartRef}></canvas>
                                </div>
                            </div>
                        )}
                        {selectedCharts.includes('category') && (
                            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="font-bold text-lg text-gray-800">Distribution by Category</h4>
                                    <div className="bg-purple-50 px-3 py-1 rounded-full text-xs font-bold text-purple-600">Analysis</div>
                                </div>
                                <div className="relative h-64 w-full flex items-center justify-center">
                                    <canvas ref={categoryPieChartRef}></canvas>
                                </div>
                            </div>
                        )}
                        {selectedCharts.includes('department') && (
                            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="font-bold text-lg text-gray-800">Impact by Department</h4>
                                    <div className="bg-indigo-50 px-3 py-1 rounded-full text-xs font-bold text-indigo-600">Breakdown</div>
                                </div>
                                <div className="relative h-64 w-full">
                                    <canvas ref={departmentBarChartRef}></canvas>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
