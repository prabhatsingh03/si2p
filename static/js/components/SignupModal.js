const { useState, useContext } = React;

const SignupModal = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useContext(AuthContext);

    const validateEmail = (email) => {
        return email.endsWith('@adventz.com');
    };

    const validatePhone = (phone) => {
        return /^\d{10}$/.test(phone);
    };

    const validatePassword = (password) => {
        const errors = [];
        if (password.length < 8) errors.push('at least 8 characters');
        if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
        if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
        if (!/[0-9]/.test(password)) errors.push('one number');
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Client-side validation
        if (!validateEmail(email)) {
            setError('Only @adventz.com email addresses are allowed');
            return;
        }

        if (!validatePhone(phone)) {
            setError('Phone number must be exactly 10 digits');
            return;
        }

        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            setError(`Password must contain ${passwordErrors.join(', ')}`);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        const result = await signup(email, fullName, phone, password, confirmPassword);
        setIsLoading(false);

        if (result.success) {
            setSuccess(result.message);
            setTimeout(() => {
                onClose();
                window.dispatchEvent(new CustomEvent('openLoginModal'));
            }, 2000);
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden animate-scaleIn ring-1 ring-gray-900/5">

                {/* Left Side - Image & Branding */}
                <div className="relative hidden md:flex flex-col justify-end p-12 text-white overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src="/static/login_modal_bg.png"
                            alt="Innovation Background"
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-blue-900/10 mix-blend-multiply"></div>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <h3 className="text-4xl font-bold font-poppins leading-tight">Join Our Innovation Network</h3>
                        <p className="text-blue-50 text-lg leading-relaxed font-light opacity-90">
                            Create your account to start submitting ideas and collaborating with teams across the organization.
                        </p>
                    </div>
                </div>

                {/* Right Side - Signup Form */}
                <div className="relative p-8 md:p-12 bg-white flex flex-col justify-center max-h-[90vh] overflow-y-auto">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 z-20"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Logo */}
                    <div className="text-center mb-6">
                        <img
                            src="/static/simon_india_logo.png"
                            alt="Logo"
                            className="h-20 mx-auto mb-4 object-contain"
                        />
                        <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 mb-2">Create Account</h2>
                        <p className="text-gray-500 font-medium text-sm">Join the innovation platform</p>
                    </div>

                    {/* Error/Success Alert */}
                    {error && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-500 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-xs text-red-700 font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 bg-green-50 border-l-4 border-green-500 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p className="text-xs text-green-700 font-medium">{success}</p>
                            </div>
                        </div>
                    )}

                    {/* Form - Compact Version */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <label htmlFor="signup-email" className="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
                            <input type="email" id="signup-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@adventz.com" required className="w-full h-9 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 outline-none bg-gray-50 focus:bg-white text-sm" />
                        </div>
                        <div>
                            <label htmlFor="signup-fullname" className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                            <input type="text" id="signup-fullname" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required className="w-full h-9 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 outline-none bg-gray-50 focus:bg-white text-sm" />
                        </div>
                        <div>
                            <label htmlFor="signup-phone" className="block text-xs font-semibold text-gray-700 mb-1">Phone (10 digits) *</label>
                            <input type="tel" id="signup-phone" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="1234567890" maxLength="10" required className="w-full h-9 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 outline-none bg-gray-50 focus:bg-white text-sm" />
                        </div>
                        <div>
                            <label htmlFor="signup-password" className="block text-xs font-semibold text-gray-700 mb-1">Password *</label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} id="signup-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 chars, 1 upper, 1 lower, 1 number" required className="w-full h-9 px-3 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 outline-none bg-gray-50 focus:bg-white text-sm" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">{showPassword ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /> : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>}</svg></button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="signup-confirm-password" className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password *</label>
                            <div className="relative">
                                <input type={showConfirmPassword ? "text" : "password"} id="signup-confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" required className="w-full h-9 px-3 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 outline-none bg-gray-50 focus:bg-white text-sm" />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">{showConfirmPassword ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /> : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>}</svg></button>
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-sm">
                            {isLoading ? <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Creating...</span></> : 'Create Account'}
                        </button>
                        <div className="text-center mt-3">
                            <p className="text-xs text-gray-600">Already have an account? <button type="button" onClick={() => { onClose(); window.dispatchEvent(new CustomEvent('openLoginModal')); }} className="font-semibold text-blue-600 hover:text-blue-700 underline">Login</button></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

window.SignupModal = SignupModal;
