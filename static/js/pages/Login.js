const { useState, useEffect, useContext } = React;

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const { login, isLoggedIn } = useContext(AuthContext);

    useEffect(() => {
        const storedEmail = localStorage.getItem('rememberedEmail');
        const storedPassword = localStorage.getItem('rememberedPassword');
        if (storedEmail && storedPassword) {
            setEmail(storedEmail);
            setPassword(storedPassword);
            setRememberMe(true);
        }
    }, []);
    const history = useHistory();

    useEffect(() => {
        if (isLoggedIn) {
            const user = JSON.parse(sessionStorage.getItem('user'));
            if (user?.role === 'superadmin' || user?.role === 'admin') history.push('/admin-dashboard');

            else if (user?.role === 'user') history.push('/submit-idea');
        }
    }, [isLoggedIn, history]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await login(email, password);
        setIsLoading(false);
        if (!result.success) {
            setError(result.error || 'Login failed. Please check your credentials.');
        } else {
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
                localStorage.setItem('rememberedPassword', password);
            } else {
                localStorage.removeItem('rememberedEmail');
                localStorage.removeItem('rememberedPassword');
            }
            if (result.user.role === 'superadmin' || result.user.role === 'admin') history.push('/admin-dashboard');

            else history.push('/submit-idea');
        }
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        setShowForgotPassword(true);
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            <ForgotPasswordModal show={showForgotPassword} onClose={() => setShowForgotPassword(false)} />
            {/* Left Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-gray-50 to-white">
                <div className="w-full max-w-md">
                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <img
                            src="/static/simon_india_logo.png"
                            alt="Company Logo"
                            className="h-24 mx-auto mb-8 object-contain"
                        />
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                            Welcome Back
                        </h1>
                        <p className="text-gray-600 text-base">
                            Sign in to access your innovation platform
                        </p>
                    </div>

                    {/* White Card Container */}
                    <div className="bg-white rounded-xl shadow-xl p-8 lg:p-12 border border-gray-100 max-w-lg w-full mx-auto">
                        {/* Error Alert */}
                        {error && (
                            <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 animate-fadeIn">
                                <div className="flex items-start gap-3">
                                    <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.email@company.com"
                                    required
                                    className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                                />
                            </div>

                            {/* Password Field */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                        Password
                                    </label>
                                    <a
                                        href="#"
                                        onClick={handleForgotPassword}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                        Forgot Password?
                                    </a>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center">
                                <input
                                    id="page-remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="page-remember-me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <React.Fragment>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Signing In...</span>
                                    </React.Fragment>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Right Side - Branding Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 items-center justify-center relative overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0"></div>
                </div>

                {/* Floating Orbs */}
                <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>

                {/* Content */}
                <div className="relative z-10 max-w-lg text-white">
                    <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                        Innovation Management Platform
                    </h2>
                    <p className="text-xl text-blue-100 mb-12 leading-relaxed">
                        Empower your organization with enterprise-grade idea management, streamlined workflows, and data-driven insights.
                    </p>

                    {/* Feature List */}
                    <div className="space-y-6">
                        <div className="flex items-start gap-4 group">
                            <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Smart Idea Submission</h3>
                                <p className="text-blue-100 text-sm leading-relaxed">Capture and organize innovative ideas from across your organization</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 group">
                            <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Admin Review & Control</h3>
                                <p className="text-blue-100 text-sm leading-relaxed">Comprehensive dashboard for reviewing and managing submissions</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 group">
                            <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Secure Enterprise Workflow</h3>
                                <p className="text-blue-100 text-sm leading-relaxed">Role-based access control and secure data management</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 group">
                            <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Real-time Status Tracking</h3>
                                <p className="text-blue-100 text-sm leading-relaxed">Track idea progress from submission to implementation</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

window.Login = Login;
