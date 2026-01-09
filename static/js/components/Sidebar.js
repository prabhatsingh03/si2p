const { useLocation, useHistory } = React;

const Sidebar = ({ userRole, isCollapsed, toggleSidebar }) => {
    const location = useLocation();
    const history = useHistory();

    const commonMenuItems = [
        {
            path: '/organization-ideas', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            ), label: 'Organization Ideas'
        }
    ];

    const adminMenuItems = [
        {
            path: '/admin-dashboard', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ), label: 'Dashboard'
        },
        {
            path: '/admin-users', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ), label: 'Users'
        }
    ];

    const adminBottomItems = [
        {
            path: '/admin-config', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ), label: 'Settings'
        }
    ];

    const userMenuItems = [
        {
            path: '/submit-idea', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            ), label: 'Submit Idea'
        },
        {
            path: '/review-my-ideas', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ), label: 'My Ideas'
        }
    ];

    const ceoMenuItems = [
        {
            path: '/organization-ideas', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            ), label: 'Organization Ideas'
        }
    ];

    const isAdmin = userRole === 'admin' || userRole === 'superadmin';
    const isCEO = userRole === 'ceo';

    // Merge common items with role-specific items
    const menuItems = isCEO
        ? ceoMenuItems
        : [...(isAdmin ? adminMenuItems : userMenuItems), ...commonMenuItems];

    const bottomItems = isAdmin ? adminBottomItems : [];

    const renderMenuItem = (item) => {
        const isActive = location.pathname === item.path;
        return (
            <button
                key={item.path}
                onClick={() => history.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm ring-1 ring-blue-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : ''}
            >
                <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                    {item.icon}
                </div>
                {!isCollapsed && <span className="font-medium animate-fadeIn">{item.label}</span>}
            </button>
        );
    };

    return (
        <div className={`fixed left-0 top-0 h-full bg-white/95 backdrop-blur-md border-r border-gray-200 shadow-2xl z-40 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            {/* Logo Section */}
            <div className={`h-24 flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-6'} border-b border-gray-200 shrink-0 relative transition-all duration-300`}>
                {!isCollapsed && (
                    <img
                        src="/static/simon_india_logo.png"
                        alt="Logo"
                        className="h-16 object-contain animate-fadeIn"
                    />
                )}
                {isCollapsed && (
                    <img
                        src="/static/simon_india_logo.png"
                        alt="Logo"
                        className="h-8 object-contain animate-fadeIn"
                    />
                )}
                {!isCollapsed && <span className="ml-3 text-lg font-bold text-gray-900 animate-fadeIn whitespace-nowrap overflow-hidden">Innovation</span>}

                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-9 p-1.5 bg-white border border-gray-200 shadow-lg rounded-full text-gray-400 hover:text-blue-600 hover:bg-white hover:scale-110 transition-all duration-200 z-50 flex items-center justify-center transform"
                >
                    {isCollapsed ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                    )}
                </button>
            </div>

            {/* CEO Dashboard Label - Only shown for CEO role */}
            {userRole === 'ceo' && !isCollapsed && (
                <div className="ceo-dashboard-label">
                    <span className="ceo-crown-icon">👑</span>
                    <span className="ceo-dashboard-label-text">CEO DASHBOARD</span>
                </div>
            )}

            {/* Scrollable Main Menu */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 overflow-x-hidden">
                {menuItems.map(renderMenuItem)}
            </nav>

            {/* Bottom Menu (Settings) */}
            {bottomItems.length > 0 && (
                <div className="p-3 border-t border-gray-100 shrink-0">
                    {bottomItems.map(renderMenuItem)}
                </div>
            )}
        </div>
    );
};

window.Sidebar = Sidebar;
