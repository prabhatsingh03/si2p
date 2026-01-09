import React, { useState, useContext, useEffect, useCallback } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { DashboardLayout } from '../components/DashboardLayout';

/**
 * SkeletonRow Component
 * Renders a row of skeleton loaders for tables
 */
const SkeletonRow = ({ cols }) => (
    <tr className="animate-pulse">
        {Array.from({ length: cols }).map((_, i) => (
            <td key={i} className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </td>
        ))}
    </tr>
);

const UserManagement = () => {
    const { user, fetchWithAuth } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [resetModalUser, setResetModalUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetchWithAuth(`${window.API_BASE_URL}/users`);
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
                setError('');
            } else {
                setError('Failed to fetch users');
            }
        } catch (err) {
            setError('Error fetching users');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [fetchWithAuth]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

        const response = await fetchWithAuth(`${window.API_BASE_URL}/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role: newRole })
        });

        if (response.ok) {
            setMessage(`User role updated to ${newRole}`);
            fetchUsers();
            setTimeout(() => setMessage(''), 3000);
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to update role');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        const response = await fetchWithAuth(`${window.API_BASE_URL}/users/${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            setMessage('User deleted successfully');
            fetchUsers();
            setTimeout(() => setMessage(''), 3000);
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to delete user');
        }
    };

    const openResetModal = (user) => {
        setResetModalUser(user);
        setNewPassword('');
    };

    const closeResetModal = () => {
        setResetModalUser(null);
        setNewPassword('');
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (!resetModalUser) return;

        const response = await fetchWithAuth(`${window.API_BASE_URL}/users/${resetModalUser.id}/password`, {
            method: 'PUT',
            body: JSON.stringify({ password: newPassword })
        });

        if (response.ok) {
            setMessage(`Password updated for ${resetModalUser.email}`);
            closeResetModal();
            setTimeout(() => setMessage(''), 3000);
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to update password');
        }
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto p-6">
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
                            <p className="text-gray-500 mt-1">Manage system access, roles, and security.</p>
                        </div>
                    </div>

                    {message && <div className="p-4 mb-6 rounded-lg bg-green-50 text-green-700 font-medium border border-green-200 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {message}
                    </div>}

                    {error && <div className="p-4 mb-6 rounded-lg bg-red-50 text-red-700 font-medium border border-red-200">{error}</div>}

                    {isLoading ? (
                        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                        <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                        <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</th>
                                        <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <SkeletonRow cols={4} />
                                    <SkeletonRow cols={4} />
                                    <SkeletonRow cols={4} />
                                    <SkeletonRow cols={4} />
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                        <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                        <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</th>
                                        <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                                        {u.email.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{u.email}</div>
                                                        <div className="text-xs text-gray-500">ID: {u.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${u.role === 'admin' || u.role === 'superadmin'
                                                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                                                    : 'bg-green-100 text-green-800 border-green-200'
                                                    }`}>
                                                    {u.role === 'admin' || u.role === 'superadmin' ? (
                                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                                    ) : (
                                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                                    )}
                                                    {u.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 font-mono tracking-widest">
                                                ********
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <div className="flex justify-center items-center space-x-3">
                                                    <button
                                                        onClick={() => handleRoleChange(u.id, u.role)}
                                                        disabled={u.id === user.id}
                                                        className={`p-2 rounded-lg transition-colors group relative ${u.id === user.id ? 'text-gray-300 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'}`}
                                                        title={u.role === 'admin' ? "Demote to User" : "Promote to Admin"}
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                        </svg>
                                                    </button>

                                                    <button
                                                        onClick={() => openResetModal(u)}
                                                        disabled={u.id === user.id && false} /* Allow changing own password */
                                                        className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors group relative"
                                                        title="Change Password"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                        </svg>
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        disabled={u.id === user.id}
                                                        className={`p-2 rounded-lg transition-colors group relative ${u.id === user.id ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
                                                        title="Delete User"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500 bg-gray-50 italic">
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            {/* Password Reset Modal */}
            {resetModalUser && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeResetModal}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handlePasswordReset}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                                Change Password
                                            </h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    Enter a new password for <strong>{resetModalUser.email}</strong>.
                                                </p>
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="New Password"
                                                    className="mt-4 appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                                    required
                                                    minLength={5}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-amber-600 text-base font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:ml-3 sm:w-auto sm:text-sm">
                                        Update Password
                                    </button>
                                    <button type="button" onClick={closeResetModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default UserManagement;
