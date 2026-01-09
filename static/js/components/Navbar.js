const Navbar = () => {
    const { user, logout, notifications, markNotificationsAsRead } = useContext(AuthContext);
    const history = useHistory();
    const location = useLocation();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const timeoutRef = useRef(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setShowUserMenu(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setShowUserMenu(false);
        }, 150);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        history.push('/', { openLogin: true });
    };

    const handleMarkRead = () => {
        markNotificationsAsRead();
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className={`bg-white/95 backdrop-blur-md p-4 app-navbar sticky top-0 z-50 transition-shadow duration-300 ${isScrolled ? 'shadow-lg' : 'shadow-md'}`}>
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => history.push('/')}>
                    <img src="/static/simon_india_logo.png" alt="Simon Logo" className="h-20" />
                    <div className="h-6 w-px bg-gray-300"></div>
                    <span className="text-xl font-bold text-gray-800 pt-1">Innovation Platform</span>
                </div>

                {user && (
                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center space-x-6">
                            {user.role === 'user' && (
                                <>
                                    <button
                                        onClick={() => history.push('/submit-idea')}
                                        className={`nav-link text-gray-600 hover:text-indigo-600 font-semibold transition duration-300 ${isActive('/submit-idea') ? 'text-indigo-600' : ''}`}
                                    >
                                        Submit Idea
                                    </button>
                                    <button
                                        onClick={() => history.push('/review-my-ideas')}
                                        className={`nav-link text-gray-600 hover:text-indigo-600 font-semibold transition duration-300 ${isActive('/review-my-ideas') ? 'text-indigo-600' : ''}`}
                                    >
                                        My Ideas
                                    </button>
                                </>
                            )}
                            {(user.role === 'admin' || user.role === 'superadmin') && (
                                <button
                                    onClick={() => history.push('/admin-dashboard')}
                                    className={`nav-link text-gray-600 hover:text-indigo-600 font-semibold transition duration-300 ${isActive('/admin-dashboard') ? 'text-indigo-600' : ''}`}
                                >
                                    Admin Dashboard
                                </button>
                            )}
                            {user.role === 'superadmin' && (
                                <button
                                    onClick={() => history.push('/admin-config')}
                                    className={`nav-link text-gray-600 hover:text-indigo-600 font-semibold transition duration-300 ${isActive('/admin-config') ? 'text-indigo-600' : ''}`}
                                >
                                    Form Config
                                </button>
                            )}
                        </div>

                        <div className="hidden md:block h-6 w-px bg-gray-300"></div>

                        <div className="relative">
                            <button onClick={() => setShowNotifications(prev => !prev)} className="relative p-2 rounded-full hover:bg-gray-100 transition">
                                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            {showNotifications && <Notifications notifications={notifications} onMarkAsRead={handleMarkRead} />}
                        </div>

                        <div
                            className="relative"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center space-x-2 focus:outline-none p-2 rounded-full hover:bg-gray-100 transition">
                                <span className="text-gray-700 font-medium hidden sm:inline">{user.email}</span>
                                <svg className={`h-5 w-5 text-gray-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </button>
                            {showUserMenu && (
                                <div
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-20 animate-fadeIn"
                                >
                                    <div className="py-1">
                                        <div className="px-4 py-2 text-xs text-gray-400">Welcome!</div>
                                        <a href="#" onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 font-medium">Logout</a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

window.Navbar = Navbar;
