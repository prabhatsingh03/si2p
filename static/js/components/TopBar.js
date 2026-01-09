const { useState, useEffect, useContext, useRef } = React;
const { useHistory } = ReactRouterDOM;

const TopBar = ({ isSidebarCollapsed }) => {
    const { user, logout, fetchWithAuth } = useContext(AuthContext);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const history = useHistory();
    const timeoutRef = useRef(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setShowProfileMenu(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setShowProfileMenu(false);
        }, 150);
    };

    // Fetch notifications
    useEffect(() => {
        if (user) {
            fetchWithAuth(`${API_BASE_URL}/notifications/user/${user.id}`)
                .then(res => res.json())
                .then(data => setNotifications(data.filter(n => !n.is_read)))
                .catch(err => console.error('Failed to fetch notifications:', err));
        }
    }, [user, fetchWithAuth]);

    const handleLogout = () => {
        logout();
        history.push('/');
    };

    const unreadCount = notifications.length;

    return (
        <div
            className={`fixed top-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm z-30 flex items-center justify-end px-8 gap-6 transition-all duration-300 ${isSidebarCollapsed ? 'left-20' : 'left-64'}`}
        >
            {/* Notifications */}
            <div className="relative">
                <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 max-h-96 overflow-y-auto">
                        <div className="px-4 py-2 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                        </div>
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-500">
                                No new notifications
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                                    <p className="text-sm text-gray-800">{notif.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(notif.created_at).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* User Profile Dropdown - Hover Interaction */}
            <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <button
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role === 'superadmin' ? 'admin' : user?.role}</p>
                    </div>
                    <svg className={`w-4 h-4 text-gray-600 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 animate-fadeIn">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

window.TopBar = TopBar;
