import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { DashboardLayout } from './DashboardLayout'; // Assuming DashboardLayout is in components
import SkeletonRow from './SkeletonRow';
// Assuming these modals are in components or pages, need to check where they were extracted
// Based on previous extractions:
// CommentModal and ViewIdeaModal might be in components or pages.
// I haven't seen them extracted yet in the "Work Done" list in current prompt, but they might be defined in index.html.
// Let me check index.html for CommentModal and ViewIdeaModal definitions later. 
// For now I will assume they are/will be imported.
// Wait, I saw CommentModal and ViewIdeaModal used in OrganizationIdeas (lines 3981, 3982).
// I need to find where they are defined.
// If they are not extracted yet, I might have issues.
// Let's assume they are available or I will fix imports later.
// Actually, looking at the code I read:
// 3981: <CommentModal ... />
// 3982: <ViewIdeaModal ... />
// I haven't extracted CommentModal or ViewIdeaModal yet.
// I should probably extract them too.
// But first, let's write OrganizationIdeas and mock/comment imports or try to locate them.
// I will check for them after writing this file.

// Placeholder imports for now
// import CommentModal from './CommentModal';
// import ViewIdeaModal from './ViewIdeaModal';

const OrganizationIdeas = () => {
    const { user, fetchWithAuth } = useContext(AuthContext);
    const [ideas, setIdeas] = useState([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialFilter = queryParams.get('filter') || 'top';

    const [filter, setFilter] = useState(initialFilter); // 'top' or 'all'
    const [loading, setLoading] = useState(true);
    const [viewModalIdea, setViewModalIdea] = useState(null);
    const [commentModalIdeaId, setCommentModalIdeaId] = useState(null); // Add state for comment modal

    const isCeo = user?.role === 'ceo';

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const f = params.get('filter');
        if (f) setFilter(f);
    }, [location.search]);

    const fetchIdeas = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetchWithAuth(`${window.API_BASE_URL}/ideas`);
            if (response.ok) {
                const data = await response.json();
                setIdeas(data);
            }
        } catch (error) {
            console.error("Failed to fetch ideas", error);
        } finally {
            setLoading(false);
        }
    }, [fetchWithAuth]);

    useEffect(() => {
        fetchIdeas();
    }, [fetchIdeas]);

    const handleReaction = async (ideaId, reactionType) => {
        setIdeas(prev => prev.map(idea => {
            if (idea.id === ideaId) {
                const currentReaction = idea.user_reaction;
                let newLikes = idea.likes || 0;
                let newDislikes = idea.dislikes || 0;
                let newReaction = reactionType;
                let newNetScore = (idea.likes || 0) - (idea.dislikes || 0);

                if (currentReaction === reactionType) {
                    newReaction = null;
                    if (reactionType === 'like') newLikes--;
                    else newDislikes--;
                } else {
                    if (reactionType === 'like') {
                        newLikes++;
                        if (currentReaction === 'dislike') newDislikes--;
                    } else {
                        newDislikes++;
                        if (currentReaction === 'like') newLikes--;
                    }
                }

                return {
                    ...idea,
                    user_reaction: newReaction,
                    likes: newLikes,
                    dislikes: newDislikes,
                    netScore: newLikes - newDislikes
                };
            }
            return idea;
        }));

        try {
            const response = await fetchWithAuth(`${window.API_BASE_URL}/ideas/${ideaId}/react`, {
                method: 'POST',
                body: JSON.stringify({ userId: user.id, reactionType: reactionType })
            });

            if (response.ok) {
                const data = await response.json();
                setIdeas(prev => prev.map(idea => {
                    if (idea.id === ideaId) {
                        return { ...idea, ...data, netScore: (data.likes || 0) - (data.dislikes || 0) };
                    }
                    return idea;
                }));
            } else {
                console.error("Reaction failed, state might be out of sync");
                fetchIdeas();
            }
        } catch (err) {
            console.error("Reaction failed", err);
            fetchIdeas();
        }
    };

    const sortedIdeas = useMemo(() => {
        let sorted = [...ideas].map(i => ({
            ...i,
            netScore: (i.likes || 0) - (i.dislikes || 0)
        }));

        if (filter === 'top') {
            sorted.sort((a, b) => b.netScore - a.netScore);
            return sorted.slice(0, 10);
        } else {
            sorted.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
            return sorted;
        }
    }, [ideas, filter]);

    if (loading) return (
        <DashboardLayout>
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Skeleton Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 animate-pulse">
                    <div className="space-y-3">
                        <div className="h-8 bg-gray-200 rounded w-64"></div>
                        <div className="h-4 bg-gray-200 rounded w-96"></div>
                    </div>
                    <div className="bg-gray-100 p-1.5 rounded-xl w-48 h-10"></div>
                </div>

                {/* Skeleton Table */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden backdrop-blur-sm">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead>
                            <tr className="bg-gray-50/80">
                                <th className="py-4 px-6 text-left w-16"><div className="h-3 bg-gray-200 rounded w-8"></div></th>
                                <th className="py-4 px-6 text-left"><div className="h-3 bg-gray-200 rounded w-24"></div></th>
                                <th className="py-4 px-6 text-left"><div className="h-3 bg-gray-200 rounded w-24"></div></th>
                                <th className="py-4 px-6 text-left"><div className="h-3 bg-gray-200 rounded w-24"></div></th>
                                <th className="py-4 px-6 text-center"><div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div></th>
                                <th className="py-4 px-6 text-center"><div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div></th>
                                <th className="py-4 px-6 text-center"><div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                            <SkeletonRow cols={7} />
                            <SkeletonRow cols={7} />
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
            */}

            {/* Temporary placeholders if modals are not yet available */}
            {commentModalIdeaId && window.CommentModal && <window.CommentModal ideaId={commentModalIdeaId} show={!!commentModalIdeaId} onClose={() => setCommentModalIdeaId(null)} />}
            {viewModalIdea && window.ViewIdeaModal && <window.ViewIdeaModal idea={viewModalIdea} show={!!viewModalIdea} onClose={() => setViewModalIdea(null)} />}


            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div className="animate-slideUp">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                            {filter === 'top' ? (
                                <>
                                    <span className="bg-yellow-100 text-yellow-700 p-2 rounded-lg">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                    </span>
                                    Top 10 Leaderboard
                                </>
                            ) : (
                                <>
                                    <span className="bg-blue-100 text-blue-700 p-2 rounded-lg">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                    </span>
                                    Organization Idea Hub
                                </>
                            )}
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg max-w-2xl">
                            {filter === 'top'
                                ? 'Recognizing the most impactful and popular innovations driving our success.'
                                : 'A centralized repository of creative solutions. Explore, vote, and collaborate.'}
                        </p>
                    </div>

                    {/* Filter Toggle */}
                    <div className="bg-gray-100 p-1.5 rounded-xl border border-gray-200 flex shadow-inner animate-slideUp">
                        <button
                            onClick={() => setFilter('top')}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 ${filter === 'top' ? 'bg-white text-yellow-700 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg> Top 10
                        </button>
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 ${filter === 'all' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> All Ideas
                        </button>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fadeIn backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead>
                                <tr className="bg-gray-50/80">
                                    <th scope="col" className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-16">Rank</th>
                                    <th scope="col" className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Idea Details</th>
                                    <th scope="col" className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted By</th>
                                    <th scope="col" className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Department</th>
                                    <th scope="col" className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Impact Score</th>
                                    <th scope="col" className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {sortedIdeas.map((idea, index) => {
                                    const rank = index + 1;
                                    const isTopView = filter === 'top';

                                    // Dynamic styling for Top 3 in Leaderboard view
                                    let rowClass = "group hover:bg-blue-50/30 transition-all duration-200";
                                    let rankBadge = <span className="text-gray-400 font-mono font-medium">#{rank}</span>;

                                    if (isTopView) {
                                        if (rank === 1) {
                                            rowClass = "bg-gradient-to-r from-yellow-50/40 to-white hover:from-yellow-50/60";
                                            rankBadge = <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-800 shadow-md border-2 border-yellow-300 font-black text-sm">1</span>;
                                        } else if (rank === 2) {
                                            rowClass = "bg-gradient-to-r from-gray-50 to-white hover:from-gray-100";
                                            rankBadge = <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 shadow-md border-2 border-gray-300 font-black text-sm">2</span>;
                                        } else if (rank === 3) {
                                            rowClass = "bg-gradient-to-r from-orange-50/40 to-white hover:from-orange-50/60";
                                            rankBadge = <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 text-orange-800 shadow-md border-2 border-orange-300 font-black text-sm">3</span>;
                                        } else {
                                            rankBadge = <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 text-gray-500 text-xs font-bold border border-gray-100">{rank}</span>;
                                        }
                                    }

                                    return (
                                        <tr key={idea.id} className={rowClass}>
                                            {/* Rank */}
                                            <td className="py-4 px-6 whitespace-nowrap text-center">
                                                {rankBadge}
                                            </td>

                                            {/* Goal / Idea Details */}
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span
                                                        className="text-base font-bold text-gray-900 mb-1 hover:text-blue-600 cursor-pointer transition-colors max-w-md truncate"
                                                        onClick={() => setViewModalIdea(idea)}
                                                        title={idea.ideaTitle}
                                                    >
                                                        {idea.ideaTitle}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                            {idea.ideaCategory}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(idea.submissionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Submitter */}
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-xs border border-blue-200 shadow-sm">
                                                        {idea.employeeName?.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-gray-900">{idea.employeeName}</span>
                                                        <span className="text-xs text-gray-400">{idea.company}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Department */}
                                            <td className="py-4 px-6">
                                                <span className="text-sm text-gray-600">
                                                    {Array.isArray(idea.departmentsImpacted)
                                                        ? idea.departmentsImpacted.join(', ')
                                                        : idea.departmentsImpacted}
                                                </span>
                                            </td>

                                            {/* Impact Score / Reactions */}
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1 bg-gray-50/80 rounded-lg p-1.5 border border-gray-100 w-fit mx-auto shadow-sm">
                                                    {!isCeo && (
                                                        <button
                                                            onClick={() => handleReaction(idea.id, 'like')}
                                                            className={`p-1 rounded transition-all active:scale-90 hover:bg-white hover:text-blue-600 ${idea.user_reaction === 'like' ? 'text-blue-600 bg-white shadow-sm ring-1 ring-black/5' : 'text-gray-400'}`}
                                                            title="Like"
                                                        >
                                                            <svg className="w-4 h-4" fill={idea.user_reaction === 'like' ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                                                        </button>
                                                    )}
                                                    <span className={`text-sm font-bold w-6 text-center ${idea.netScore > 0 ? 'text-green-600' : (idea.netScore < 0 ? 'text-red-500' : 'text-gray-500')}`}>
                                                        {idea.netScore || 0}
                                                    </span>
                                                    {!isCeo && (
                                                        <button
                                                            onClick={() => handleReaction(idea.id, 'dislike')}
                                                            className={`p-1 rounded transition-all active:scale-90 hover:bg-white hover:text-red-500 ${idea.user_reaction === 'dislike' ? 'text-red-500 bg-white shadow-sm ring-1 ring-black/5' : 'text-gray-400'}`}
                                                            title="Dislike"
                                                        >
                                                            <svg className="w-4 h-4" fill={idea.user_reaction === 'dislike' ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="py-4 px-6 text-center whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${idea.status === 'Approved' ? 'bg-green-100 text-green-800 border-green-200' :
                                                    idea.status === 'Shortlisted' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                                        idea.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                            idea.status === 'Rejected' ? 'bg-red-50 text-red-800 border-red-100' :
                                                                'bg-gray-100 text-gray-800 border-gray-200'
                                                    }`}>
                                                    {idea.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-6 text-center whitespace-nowrap">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => setViewModalIdea(idea)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                        title="View Details"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => setCommentModalIdeaId(idea.id)}
                                                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                                                        title="View Comments"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {sortedIdeas.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-gray-400 italic bg-gray-50/50">
                                            No ideas found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer / Pagination hint (Optional) */}
                <div className="mt-4 text-center text-xs text-gray-400">
                    Showing {sortedIdeas.length} {filter === 'top' ? 'top-ranked' : ''} ideas
                </div>
            </div>
        </DashboardLayout>
    );
};

export default OrganizationIdeas;
