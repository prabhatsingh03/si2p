const ViewIdeaModal = ({ idea, show, onClose }) => {
    if (!show || !idea) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Submitted Idea
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">Read-only view of submitted idea</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="overflow-y-auto flex-grow p-6">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="md:col-span-3 mb-1 flex items-center gap-2">
                                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">User ID:</span>
                                <button
                                    onClick={() => navigator.clipboard.writeText(idea.user_id)}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer transition-colors border border-blue-200"
                                    title="Click to copy User ID"
                                >
                                    {idea.user_id}
                                    <svg className="ml-1.5 h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            </div>
                            <div>
                                <p className="font-semibold text-blue-900">Submitted By</p>
                                <p className="text-blue-700">{idea.employeeName}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-blue-900">Submission Date</p>
                                <p className="text-blue-700">{new Date(idea.submissionDate).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-blue-900">Current Status</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${idea.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                    idea.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                        idea.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-blue-100 text-blue-800'
                                    }`}>{idea.status}</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Employee Name</label>
                                <div className="p-3 bg-gray-50 rounded-lg border">{idea.employeeName}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Company</label>
                                <div className="p-3 bg-gray-50 rounded-lg border">{idea.company}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Idea Category</label>
                                <div className="p-3 bg-gray-50 rounded-lg border">{idea.ideaCategory}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Department Impacted</label>
                                <div className="p-3 bg-gray-50 rounded-lg border">{Array.isArray(idea.departmentsImpacted) ? idea.departmentsImpacted.join(', ') : idea.departmentsImpacted}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Availability of Data</label>
                                <div className="p-3 bg-gray-50 rounded-lg border">{idea.availabilityOfData}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Implementation Timeline</label>
                                <div className="p-3 bg-gray-50 rounded-lg border">{idea.implementationTimeline}</div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Idea Title</label>
                                <div className="p-3 bg-gray-50 rounded-lg border font-medium">{idea.ideaTitle}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Problem Statement</label>
                                <div className="p-3 bg-gray-50 rounded-lg border whitespace-pre-wrap max-h-32 overflow-y-auto">{idea.problemStatement}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Proposed Solution</label>
                                <div className="p-3 bg-gray-50 rounded-lg border whitespace-pre-wrap max-h-32 overflow-y-auto">{idea.proposedSolution}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Expected Benefits / ROI</label>
                                <div className="p-3 bg-gray-50 rounded-lg border whitespace-pre-wrap max-h-24 overflow-y-auto">{idea.expectedBenefits}</div>
                            </div>
                            {idea.dataSources && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Data Sources</label>
                                    <div className="p-3 bg-gray-50 rounded-lg border whitespace-pre-wrap">{idea.dataSources}</div>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Estimated Cost / Resource Need</label>
                                <div className="p-3 bg-gray-50 rounded-lg border whitespace-pre-wrap">{idea.estimatedCost}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end p-6 border-t bg-gray-50">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewIdeaModal;
