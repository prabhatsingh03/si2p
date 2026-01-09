const ConfirmationModal = ({ show, onClose, onConfirm, title, children }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
                <div className="text-gray-600 mb-6">
                    {children}
                </div>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

window.ConfirmationModal = ConfirmationModal;
