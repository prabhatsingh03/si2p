const Notifications = ({ notifications, onMarkAsRead }) => {
    const getIconAndColor = (type) => {
        switch (type) {
            case 'New Idea': return { icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z', color: 'text-green-500' };
            case 'Status Update': return { icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-blue-500' };
            case 'New Comment': return { icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-yellow-500' };
            default: return { icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-gray-500' };
        }
    };

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-xl z-20">
            <div className="p-4 flex justify-between items-center border-b">
                <h3 className="font-bold text-lg">Notifications</h3>
                {notifications.some(n => !n.read) && (
                    <button onClick={onMarkAsRead} className="text-sm text-blue-600 hover:underline">Mark all as read</button>
                )}
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                        {notifications.map(notif => {
                            const { icon, color } = getIconAndColor(notif.type);
                            return (
                                <li key={notif.id} className={`p-3 ${!notif.read ? 'bg-blue-50' : 'bg-white'}`}>
                                    <div className="flex items-start gap-3">
                                        <svg className={`h-6 w-6 flex-shrink-0 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} /></svg>
                                        <div>
                                            <p className="text-sm text-gray-700">{notif.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 p-6">No new notifications.</p>
                )}
            </div>
        </div>
    );
};

window.Notifications = Notifications;
