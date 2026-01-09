const { useState, useContext } = React;

const DashboardLayout = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar userRole={user?.role} isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <TopBar isSidebarCollapsed={isSidebarCollapsed} />
                <div className="pt-16 p-6 flex-grow">
                    {children}
                </div>
            </div>
        </div>
    );
};

window.DashboardLayout = DashboardLayout;
