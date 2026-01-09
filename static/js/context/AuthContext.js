import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL, SUPERADMIN_EMAIL } from '../config.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const notificationIntervalRef = useRef(null);

    const logout = useCallback(() => {
        // Clear notification polling interval
        if (notificationIntervalRef.current) {
            clearInterval(notificationIntervalRef.current);
            notificationIntervalRef.current = null;
        }

        // Clear notifications
        setNotifications([]);

        // Clear session
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        setUser(null);
        setIsLoggedIn(false);
    }, []);

    const fetchWithAuth = useCallback(async (url, options = {}) => {
        const token = sessionStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
            'Authorization': token ? `Bearer ${token}` : ''
        };

        const response = await fetch(url, { ...options, headers });

        // Auto-logout on 401 Unauthorized
        if (response.status === 401) {
            console.warn('Session expired (401). Logging out...');
            logout();
        }

        return response;
    }, [logout]);

    const fetchNotifications = useCallback(async (userId) => {
        if (!userId) return;
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/notifications/user/${userId}`);

            // Only process if response is OK
            if (response.ok) {
                const data = await response.json();
                const formattedNotifications = data.map(n => ({
                    id: n.id,
                    message: n.message,
                    read: n.is_read === 1,
                    createdAt: n.created_at,
                    type: n.message.includes('updated to') ? 'Status Update' : (n.message.includes('commented on') ? 'New Comment' : 'New Idea'),
                    severity: 'info'
                }));
                setNotifications(formattedNotifications);
            } else if (response.status === 401) {
                // 401 handled by fetchWithAuth, clear notifications
                setNotifications([]);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    }, [fetchWithAuth]);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        const storedToken = sessionStorage.getItem('token');

        // Clear any existing interval
        if (notificationIntervalRef.current) {
            clearInterval(notificationIntervalRef.current);
            notificationIntervalRef.current = null;
        }

        if (storedUser && storedToken) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.email === SUPERADMIN_EMAIL) {
                parsedUser.role = 'superadmin';
            } else if (parsedUser.email === 'ceo@adventz.com') {
                parsedUser.role = 'ceo';
            }
            setUser(parsedUser);
            setIsLoggedIn(true);
            setLoading(false);

            // Fetch immediately and start polling
            fetchNotifications(parsedUser.id);
            notificationIntervalRef.current = setInterval(() => {
                fetchNotifications(parsedUser.id);
            }, 30000); // Poll every 30s
        } else {
            setLoading(false);
        }

        // Cleanup on unmount or when dependencies change
        return () => {
            if (notificationIntervalRef.current) {
                clearInterval(notificationIntervalRef.current);
                notificationIntervalRef.current = null;
            }
        };
    }, [fetchNotifications]);

    const login = async (email, password) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/login`, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.ok) {
            const loggedInUser = data.user;
            const token = data.token;
            if (loggedInUser.email === SUPERADMIN_EMAIL) {
                loggedInUser.role = 'superadmin';
            } else if (loggedInUser.email === 'ceo@adventz.com') {
                loggedInUser.role = 'ceo';
            }
            sessionStorage.setItem('user', JSON.stringify(loggedInUser));
            sessionStorage.setItem('token', token);
            setUser(loggedInUser);
            setIsLoggedIn(true);
            fetchNotifications(loggedInUser.id);
            return { success: true, user: loggedInUser };
        } else {
            return { success: false, error: data.error };
        }
    };

    const signup = async (email, fullName, phone, password, confirmPassword) => {
        const response = await fetchWithAuth(`${API_BASE_URL}/signup`, {
            method: 'POST',
            body: JSON.stringify({ email, fullName, phone, password, confirmPassword }),
        });
        const data = await response.json();
        if (response.ok) {
            return { success: true, message: data.message };
        } else {
            return { success: false, error: data.error };
        }
    };

    const markNotificationsAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length === 0) return;

        const response = await fetchWithAuth(`${API_BASE_URL}/notifications/mark-read`, {
            method: 'POST',
            body: JSON.stringify({ ids: unreadIds }),
        });

        if (response.ok) {
            setNotifications(prev => prev.map(n => unreadIds.includes(n.id) ? { ...n, read: true } : n));
        }
    };

    const value = {
        user,
        isLoggedIn,
        loading,
        login,
        signup,
        logout,
        notifications,
        markNotificationsAsRead,
        fetchWithAuth
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
