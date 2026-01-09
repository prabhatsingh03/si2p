const { useState, useEffect, useCallback, useContext } = React;
const { useHistory, useLocation, Redirect } = ReactRouterDOM;

const ReviewIdeas = () => {
    const { user, fetchWithAuth } = useContext(AuthContext);
    const [userIdeas, setUserIdeas] = useState([]);
    const [comments, setComments] = useState([]);
    const history = useHistory();
    const location = useLocation();
    const [expandedIdeaId, setExpandedIdeaId] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [ideaToWithdraw, setIdeaToWithdraw] = useState(null);
    const [activeTab, setActiveTab] = useState('submitted');

    const newIdeaId = location.state?.newIdeaId;

    const fetchUserIdeas = useCallback(async () => {
        if (user?.id) {
            const response = await fetchWithAuth(`${API_BASE_URL}/ideas/user/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setUserIdeas(data);
            }
        }
    }, [user, fetchWithAuth]);

    const fetchComments = useCallback(async (ideaId) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/ideas/${ideaId}/comments`);
        if (response.ok) {
            const data = await response.json();
            setComments(data);
        }
    }, [fetchWithAuth]);

    useEffect(() => {
        fetchUserIdeas();
    }, [fetchUserIdeas]);

    useEffect(() => {
        if (expandedIdeaId) {
            fetchComments(expandedIdeaId);
        }
    }, [expandedIdeaId, fetchComments]);

    const handleAction = (action, idea) => {
        if (action === 'edit') {
            history.push({ pathname: '/submit-idea', state: { idea } });
        } else if (action === 'withdraw') {
            setIdeaToWithdraw(idea);
            setShowConfirmModal(true);
        }
    };

    const confirmWithdraw = async () => {
        if (!ideaToWithdraw) return;
        const response = await fetchWithAuth(`${API_BASE_URL}/ideas/${ideaToWithdraw.id}`, { method: 'DELETE' });
        if (response.ok) {
            fetchUserIdeas();
        } else {
            console.error('Failed to withdraw idea.');
        }
        setShowConfirmModal(false);
        setIdeaToWithdraw(null);
    };

    const getStatusClass = (status) => {
        const classes = {
            'Submitted': 'bg-blue-100 text-blue-800 border-blue-200',
            'Under Review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Shortlisted': 'bg-purple-100 text-purple-800 border-purple-200',
            'Approved': 'bg-green-100 text-green-800 border-green-200',
            'Rejected': 'bg-red-50 text-red-800 border-red-100',
            'Draft': 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    };

    const submittedIdeas = userIdeas.filter(idea => idea.status !== 'Draft');
    const draftIdeas = userIdeas.filter(idea => idea.status === 'Draft');

    const ideasToShow = activeTab === 'submitted' ? submittedIdeas : draftIdeas;

    if (!user) return <Redirect to={{ pathname: "/", state: { openLogin: true } }} />;

    return (
        <DashboardLayout>
            <ConfirmationModal
                show={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmWithdraw}
                title="Confirm Withdrawal"
            >
                <p>Are you sure you want to withdraw this idea? This action cannot be undone.</p>
            </ConfirmationModal>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 animate-slideUp">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <span className="bg-indigo-100 text-indigo-700 p-2 rounded-lg">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        </span>
                        My Ideas
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">Manage your submissions and track their progress.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fadeIn backdrop-blur-sm">
                    <div className="flex border-b border-gray-100 bg-gray-50/50">
                        <button
                            onClick={() => setActiveTab('submitted')}
                            className={`py-4 px-6 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'submitted' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Submitted Ideas
                        </button>
                        <button
                            onClick={() => setActiveTab('drafts')}
                            className={`py-4 px-6 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'drafts' ? 'border-amber-500 text-amber-700 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> Drafts
                        </button>
                    </div>

                    {ideasToShow.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50/30">
                            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No {activeTab === 'submitted' ? 'Submitted Ideas' : 'Drafts'}</h3>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">You haven't {activeTab === 'submitted' ? 'submitted' : 'created'} any ideas yet. Start innovating today!</p>
                            <button onClick={() => history.push('/submit-idea')} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                                + Submit New Idea
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto min-h-[300px]">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50/80 sticky top-0 backdrop-blur-sm z-10">
                                    <tr>
                                        <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Idea Title</th>
                                        <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Last Edited</th>
                                        <th className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 bg-white">
                                    {ideasToShow.map((idea, index) => (
                                        <React.Fragment key={idea.id}>
                                            <tr className={`group hover:bg-blue-50/30 transition-all duration-200 ${idea.id === newIdeaId ? 'bg-green-50 animate-pulse-glow' : ''}`}>
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{idea.ideaTitle}</div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                        {idea.ideaCategory}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusClass(idea.status)}`}>
                                                        {idea.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-500">
                                                    {idea.last_edited_at ? new Date(idea.last_edited_at).toLocaleDateString() : new Date(idea.submissionDate).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-6 text-center whitespace-nowrap">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => setExpandedIdeaId(expandedIdeaId === idea.id ? null : idea.id)}
                                                            className={`p-1.5 rounded-lg transition-colors border border-transparent ${expandedIdeaId === idea.id ? 'bg-indigo-100 text-indigo-700' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100'}`}
                                                            title={expandedIdeaId === idea.id ? "Hide Details" : "View Details & Comments"}
                                                        >
                                                            {expandedIdeaId === idea.id ? (
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                                            ) : (
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                            )}
                                                        </button>

                                                        {idea.status === 'Draft' && (
                                                            <button onClick={() => handleAction('edit', idea)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-100" title="Edit Concept">
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                            </button>
                                                        )}

                                                        {(idea.status === 'Submitted' || idea.status === 'Draft') && (
                                                            <button onClick={() => handleAction('withdraw', idea)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Withdraw Idea">
                                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedIdeaId === idea.id && (
                                                <tr className="bg-gray-50/50 animate-fadeIn">
                                                    <td colSpan="5" className="p-0 border-b border-gray-100">
                                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 shadow-inner">
                                                            <div className="space-y-4">
                                                                <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">Idea Details</h4>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <p className="text-xs font-bold text-gray-500 uppercase">Employee</p>
                                                                        <p className="text-sm font-semibold text-gray-900">{idea.employeeName}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-bold text-gray-500 uppercase">Company</p>
                                                                        <p className="text-sm font-semibold text-gray-900">{idea.company}</p>
                                                                    </div>
                                                                    <div className="col-span-2">
                                                                        <p className="text-xs font-bold text-gray-500 uppercase">Department Impacted</p>
                                                                        <p className="text-sm font-semibold text-gray-900">{Array.isArray(idea.departmentsImpacted) ? idea.departmentsImpacted.join(', ') : idea.departmentsImpacted || 'N/A'}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="pt-4">
                                                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Problem Statement</p>
                                                                    <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200 shadow-sm leading-relaxed">{idea.problemStatement}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Proposed Solution</p>
                                                                    <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200 shadow-sm leading-relaxed">{idea.proposedSolution}</p>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4 border-l border-gray-200 pl-8">
                                                                <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                                                                    <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                                    Feedback / Comments
                                                                </h4>

                                                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-full max-h-96 overflow-y-auto">
                                                                    {comments.length > 0 ? (
                                                                        <ul className="space-y-4">
                                                                            {comments.map(c => (
                                                                                <li key={c.id} className="flex gap-3">
                                                                                    <div className={`mt-1 w-2 h-full min-h-[2rem] rounded-full ${c.role === 'admin' || c.role === 'superadmin' ? 'bg-purple-400' : 'bg-blue-400'}`}></div>
                                                                                    <div className="flex-1">
                                                                                        <div className="flex justify-between items-center mb-1">
                                                                                            <span className="font-bold text-xs text-gray-900">
                                                                                                {c.role === 'superadmin' ? 'Admin Team' : c.email.split('@')[0]}
                                                                                            </span>
                                                                                            <span className="text-[10px] text-gray-400">{new Date(c.created_at).toLocaleDateString()}</span>
                                                                                        </div>
                                                                                        <p className="text-sm text-gray-700">{c.comment}</p>
                                                                                    </div>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    ) : (
                                                                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                                                                            <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                                            <p className="text-sm">No feedback received yet.</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

window.ReviewIdeas = ReviewIdeas;
