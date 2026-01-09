const { useState, useEffect, useContext } = React;

const LandingPage = () => {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isLoggedIn } = useContext(AuthContext);
    const history = useHistory();

    // Listen for custom events to switch modals
    useEffect(() => {
        const handleOpenSignup = () => {
            setShowLoginModal(false);
            setShowSignupModal(true);
        };
        const handleOpenLogin = () => {
            setShowSignupModal(false);
            setShowLoginModal(true);
        };

        window.addEventListener('openSignupModal', handleOpenSignup);
        window.addEventListener('openLoginModal', handleOpenLogin);

        return () => {
            window.removeEventListener('openSignupModal', handleOpenSignup);
            window.removeEventListener('openLoginModal', handleOpenLogin);
        };
    }, []);

    // Auto-slide images
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % 3);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // Redirect if already logged in
    useEffect(() => {
        if (isLoggedIn) {
            const user = JSON.parse(sessionStorage.getItem('user'));
            if (user?.role === 'admin' || user?.role === 'superadmin') {
                history.push('/admin-dashboard');
            } else {
                history.push('/submit-idea');
            }
        }
    }, [isLoggedIn, history]);

    const features = [
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            title: "Secure Platform",
            description: "Enterprise-grade security with role-based access control"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            title: "Enterprise Ready",
            description: "Built for organizations of all sizes with scalable architecture"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            title: "Analytics Driven",
            description: "Data-driven insights to track and measure innovation impact"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            title: "Role Based Access",
            description: "Granular permissions for admins, reviewers, and contributors"
        }
    ];

    const slides = [
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop"
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Fixed Navbar */}
            <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo + Name */}
                        <div className="flex items-center gap-3">
                            <img
                                src="/static/simon_india_logo.png"
                                alt="Company Logo"
                                className="h-20"
                            />
                            <span className="text-xl font-bold text-gray-900 tracking-tight">Innovation Platform</span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-4">
                            <button onClick={() => setShowLoginModal(true)} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
                                Login
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-500 hover:text-gray-900 focus:outline-none">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {isMobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 animate-fadeIn">
                        <div className="px-4 pt-2 pb-4 space-y-1">
                            <button
                                onClick={() => {
                                    setShowLoginModal(true);
                                    setIsMobileMenuOpen(false);
                                }}
                                className="block w-full text-center px-4 py-3 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md"
                            >
                                Login
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <div className="pt-24 pb-16 relative overflow-hidden mt-8 min-h-[calc(100vh-5rem)]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 z-0"></div>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-100/40 to-transparent blur-3xl"></div>
                <div className="w-full px-6 lg:px-12 xl:px-16 relative z-10 h-full">
                    <div className="grid lg:grid-cols-2 gap-8 items-center h-full">
                        {/* Left: Text Content */}
                        <div className="space-y-6 lg:pl-8">
                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                                Transform Ideas Into
                                <span className="flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 pb-2 pl-4">
                                    <svg className="w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <linearGradient id="lightbulb-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" style={{ stopColor: '#2563EB', stopOpacity: 1 }} />
                                                <stop offset="100%" style={{ stopColor: '#6366F1', stopOpacity: 1 }} />
                                            </linearGradient>
                                        </defs>
                                        <path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.5-1.5 4.5-3 6v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2c-1.5-1.5-3-3.5-3-6a6 6 0 0 1 6-6z" stroke="url(#lightbulb-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                        <path d="M9 18h6" stroke="url(#lightbulb-gradient)" strokeWidth="2" strokeLinecap="round" />
                                        <circle cx="12" cy="9" r="1.5" fill="url(#lightbulb-gradient)" opacity="0.8" />
                                    </svg>
                                    <span>Innovation Reality</span>
                                </span>
                            </h1>
                            <p className="text-xl text-gray-600 leading-relaxed">
                                Empower your organization with our enterprise-grade idea management platform.
                                Capture, evaluate, and implement innovative solutions seamlessly.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowSignupModal(true)}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    Get Started
                                </button>

                            </div>
                        </div>

                        {/* Right: Image Slider */}
                        <div className="relative min-h-[500px] lg:min-h-[600px] rounded-2xl overflow-hidden shadow-2xl lg:mr-8">
                            {slides.map((slide, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                                        }`}
                                >
                                    <img
                                        src={slide}
                                        alt={`Slide ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                            {/* Slide Indicators */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                {slides.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* Feature Cards Section */}
            <div className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Why Choose Our Platform?
                        </h2>
                        <p className="text-xl text-gray-600">
                            Built for enterprise teams who demand excellence
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 border border-gray-100 hover:border-blue-200/50"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 group-hover:from-blue-600 group-hover:to-purple-600 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-blue-500/30">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div >

            {/* About Company Section */}
            < div className="py-20 bg-gray-900 text-white relative overflow-hidden" >
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-bold mb-6">Engineering Excellence Since 1995</h2>
                            <p className="text-gray-400 text-lg leading-relaxed mb-8">
                                Simon India Limited, an Adventz Group company, is a global leader in EPC, EPCM, and Project Management Consultancy.
                                We deliver world-class solutions across Chemicals, Fertilizers, Oil & Gas, and Renewable Energy sectors, driving industrial growth through innovation and sustainable practices.
                            </p>
                            <div className="grid grid-cols-3 gap-8 border-t border-gray-800 pt-8">
                                <div>
                                    <div className="text-3xl font-bold text-blue-500 mb-1">30+</div>
                                    <div className="text-sm text-gray-500 uppercase tracking-wider">Years Exp.</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-purple-500 mb-1">Global</div>
                                    <div className="text-sm text-gray-500 uppercase tracking-wider">Presence</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-green-500 mb-1">75+</div>
                                    <div className="text-sm text-gray-500 uppercase tracking-wider">Major Projects</div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl transform rotate-3 opacity-20"></div>
                            <img
                                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                                alt="Company Building"
                                className="relative rounded-2xl shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </div >

            {/* Footer */}
            < footer className="bg-white border-t border-gray-200 pt-16 pb-8" >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-2 md:col-span-1">
                            <img src="/static/simon_india_logo.png" alt="Logo" className="h-16 mb-4" />
                            <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                A leading EPC company delivering excellence in Chemicals, Fertilizers, and Energy sectors.
                            </p>
                            <address className="not-italic text-sm text-gray-500 leading-relaxed">
                                8th Floor, Adventz Tower A,<br />
                                Global Business Park, M.G. Road,<br />
                                Gurgaon-122002, Haryana, India
                            </address>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">Platform</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="https://www.simonindia.com/services" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">Services</a></li>
                                <li><a href="https://www.simonindia.com/projects" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">Projects</a></li>
                                <li><a href="https://www.simonindia.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">Updates</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="https://www.simonindia.com/about-us" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">About Us</a></li>
                                <li><a href="https://www.simonindia.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">Careers</a></li>
                                <li><a href="https://www.simonindia.com/contact-us" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">Contact</a></li>
                            </ul>
                        </div>
                        <div className="flex flex-col items-center">
                            <h4 className="font-bold text-gray-900 mb-4">Connect</h4>
                            <div className="flex justify-center gap-4">
                                <a href="https://in.linkedin.com/company/simonindia" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg></a>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-500">© 2025 Innovation Platform. All rights reserved.</p>
                        <div className="flex gap-6 text-sm text-gray-500">
                            <a href="https://www.simonindia.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition">Privacy Policy</a>
                            <a href="https://www.simonindia.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer >

            {/* Login Modal */}
            {showLoginModal && (
                <LoginModal onClose={() => setShowLoginModal(false)} />
            )}

            {/* Signup Modal */}
            {showSignupModal && (
                <SignupModal onClose={() => setShowSignupModal(false)} />
            )}
        </div>
    );
};

window.LandingPage = LandingPage;
