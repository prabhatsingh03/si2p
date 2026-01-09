const { useState, useMemo, useContext } = React;
const { useHistory, useLocation, Redirect } = ReactRouterDOM;

const SubmitIdea = () => {
    const { user, fetchWithAuth } = useContext(AuthContext);
    const { formConfig } = useContext(FormConfigContext);
    const history = useHistory();
    const location = useLocation();

    const getInitialFormState = () => {
        const initialState = {};
        formConfig.forEach(field => {
            initialState[field.name] = '';
        });
        return initialState;
    };

    const [formData, setFormData] = useState(getInitialFormState);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [submittingStatus, setSubmittingStatus] = useState(null);



    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isSubmittable = useMemo(() => {
        for (const field of formConfig) {
            if (!field.required) continue;
            if (field.dependsOn && formData[field.dependsOn] !== field.dependsOnValue) continue;
            if (!formData[field.name] || (typeof formData[field.name] === 'string' && formData[field.name].trim() === '')) {
                return false;
            }
        }
        return true;
    }, [formData, formConfig]);

    const isDraftable = useMemo(() => {
        return formData.employeeName?.trim() && formData.ideaTitle?.trim();
    }, [formData.employeeName, formData.ideaTitle]);

    const handleSubmit = async (e, status) => {
        e.preventDefault();
        if (submittingStatus) return;

        setSubmittingStatus(status);
        setMessage('');

        const payload = { ...formData, status, submissionDate: new Date().toISOString(), userId: user.id };

        const method = location.state?.idea ? 'PUT' : 'POST';
        const url = location.state?.idea ? `${API_BASE_URL}/ideas/${location.state.idea.id}` : `${API_BASE_URL}/ideas`;

        try {
            const response = await fetchWithAuth(url, {
                method: method,
                body: JSON.stringify(payload)
            });

            // Check content type before parsing
            const contentType = response.headers.get("content-type");
            let result;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                result = await response.json();
            } else {
                // Fallback for non-JSON responses
                const text = await response.text();
                throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`);
            }

            if (response.ok) {
                history.push({
                    pathname: '/review-my-ideas',
                    state: { newIdeaId: result.id || location.state?.idea?.id }
                });
            } else {
                setMessage(result.error || `Error: ${response.statusText}`);
                setMessageType('error');
            }
        } catch (error) {
            console.error("Submission error:", error);
            setMessage(error.message || 'An unexpected error occurred during submission.');
            setMessageType('error');
        } finally {
            setSubmittingStatus(null);
        }
    };

    if (!user) return <Redirect to={{ pathname: "/", state: { openLogin: true } }} />;

    return (
        <DashboardLayout>

            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-xl max-w-4xl mx-auto border border-gray-200">
                <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-2">{location.state?.idea ? 'Edit Your Idea' : 'Submit Your Idea'}</h2>
                <p className="text-center text-gray-500 mb-8">Your ideas fuel our growth. Let's transform Adventz together.</p>

                {message && <div className={`p-4 mb-6 rounded-lg ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}><p>{message}</p></div>}
                <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {formConfig.map(field => {
                        if (field.dependsOn && formData[field.dependsOn] !== field.dependsOnValue) {
                            return null;
                        }
                        return <FormInput
                            key={field.id}
                            fieldConfig={field}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                            className={field.className}
                        />
                    })}
                    <div className="md:col-span-2 flex justify-end items-center gap-4 mt-6 pt-6 border-t border-gray-100">
                        <button type="button" onClick={(e) => handleSubmit(e, 'Draft')} disabled={!isDraftable || submittingStatus} className="px-6 py-2.5 text-gray-700 font-semibold bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                            {submittingStatus === 'Draft' ? 'Saving...' : 'Save as Draft'}
                        </button>
                        <button type="submit" onClick={(e) => handleSubmit(e, 'Submitted')} disabled={!isSubmittable || submittingStatus} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 px-8 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:from-blue-300 disabled:to-indigo-300 disabled:cursor-not-allowed">
                            {submittingStatus === 'Submitted' ? 'Submitting...' : (location.state?.idea ? 'Update & Submit' : 'Submit Idea')}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

window.SubmitIdea = SubmitIdea;
