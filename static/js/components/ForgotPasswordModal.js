const { useState } = React;

const ForgotPasswordModal = ({ show, onClose }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    if (!show) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            if (email.endsWith('@adventz.com')) {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    onClose();
                }, 3000);
            } else {
                setError('Please enter a valid @adventz.com email address.');
            }
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scaleIn ring-1 ring-white/20">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 19.464a3 3 0 01-.894.553l-4.486 1.347a1 1 0 01-1.347-1.347l1.347-4.486a3 3 0 01.553-.894l2.743-2.743A6 6 0 0115 7z" /></svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Reset Password</h3>
                    <p className="text-gray-500 mt-2 text-sm">Enter your email address and we'll send you a link to reset your password.</p>
                </div>

                {success ? (
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm text-center font-medium animate-fadeIn">
                        <p>Reset link sent! Please check your inbox.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <p className="text-sm text-red-600 text-center font-medium">{error}</p>}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400 text-gray-900 bg-gray-50 focus:bg-white"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <button onClick={onClose} className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

window.ForgotPasswordModal = ForgotPasswordModal;
