const FormInput = ({ fieldConfig, value, onChange, className = '' }) => {
    const { label, type, name, options, required, placeholder } = fieldConfig;
    const baseClasses = "mt-1 block w-full p-3 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 ease-in-out bg-gray-50 focus:bg-white";
    const labelClasses = "block text-sm font-semibold text-gray-700 mb-1.5";

    const renderLabel = () => (
        <label htmlFor={name} className={labelClasses}>
            {label} {required && <span className="text-red-600 font-bold">*</span>}
        </label>
    );

    switch (type) {
        case 'text':
        case 'email':
        case 'password':
            return (
                <div className={`mb-4 ${className}`}>
                    {renderLabel()}
                    <input type={type} name={name} id={name} value={value} onChange={onChange} required={required} placeholder={placeholder} className={baseClasses} />
                </div>
            );
        case 'textarea':
            return (
                <div className={`mb-4 ${className}`}>
                    {renderLabel()}
                    <textarea name={name} id={name} value={value} onChange={onChange} required={required} placeholder={placeholder} rows="4" className={baseClasses}></textarea>
                </div>
            );
        case 'dropdown':
            return (
                <div className={`mb-4 ${className}`}>
                    {renderLabel()}
                    <select name={name} id={name} value={value} onChange={onChange} required={required} className={baseClasses}>
                        <option value="">Select an option</option>
                        {options.map((option) => (<option key={option} value={option}>{option}</option>))}
                    </select>
                </div>
            );
        case 'radio':
            return (
                <div className={`mb-4 ${className}`}>
                    {renderLabel()}
                    <div className="mt-2 flex items-center gap-x-6">
                        {options.map(option => (
                            <label key={option} className="flex items-center">
                                <input type="radio" name={name} value={option} checked={value === option} onChange={onChange} required={required} className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" /> {option}
                            </label>
                        ))}
                    </div>
                </div>
            );
        case 'multiselect':
            return (
                <div className={`mb-4 ${className}`}>
                    {renderLabel()}
                    <select name={name} id={name} multiple value={value} onChange={onChange} required={required} className={`${baseClasses} h-32`}>
                        {options.map((option) => (<option key={option} value={option}>{option}</option>))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple options</p>
                </div>
            );
        default:
            return null;
    }
};

export default FormInput;
