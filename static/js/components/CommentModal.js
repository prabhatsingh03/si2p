import { useState, useContext, useCallback, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext.js';
import { API_BASE_URL } from '../config.js';

const CommentModal = ({ ideaId, show, onClose, onCommentAdded }) => {
    const { user, fetchWithAuth } = useContext(AuthContext);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const fetchComments = useCallback(async () => {
        if (!ideaId) return;
        setIsLoading(true);
        const response = await fetchWithAuth(`${API_BASE_URL}/ideas/${ideaId}/comments`);
        if (response.ok) {
            const data = await response.json();
            setComments(data);
        }
        setIsLoading(false);
    }, [ideaId, fetchWithAuth]);

    useEffect(() => {
        if (show) {
            fetchComments();
        }
    }, [show, fetchComments]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const response = await fetchWithAuth(`${API_BASE_URL}/ideas/${ideaId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ userId: user.id, comment: newComment }),
        });

        if (response.ok) {
            setNewComment("");
            fetchComments(); // Refresh comments list
            if (onCommentAdded) onCommentAdded();
        } else {
            alert("Failed to add comment.");
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Comment History</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                <div className="overflow-y-auto flex-grow mb-4 pr-2">
                    {isLoading ? <p>Loading comments...</p> : (
                        comments.length > 0 ? (
                            <ul className="space-y-4">
                                {comments.map(comment => (
                                    <li key={comment.id} className="p-3 rounded-lg bg-gray-50 border">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-semibold text-sm text-gray-800">{comment.email} <span className="text-xs text-gray-500 font-normal">({comment.role})</span></p>
                                            <p className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</p>
                                        </div>
                                        <p className="text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-center text-gray-500">No comments yet.</p>
                    )}
                </div>
                <form onSubmit={handleAddComment}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a new comment..."
                        className="w-full p-2 border rounded-md"
                        rows="3"
                    ></textarea>
                    <div className="flex justify-end mt-4">
                        <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Comment</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CommentModal;
