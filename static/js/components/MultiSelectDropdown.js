const { useState, useEffect, useRef } = React;

const MultiSelectDropdown = ({ options, selectedOptions, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleToggle = (optionKey) => {
        const newSelection = selectedOptions.includes(optionKey)
            ? selectedOptions.filter(key => key !== optionKey)
            : [...selectedOptions, optionKey];
        onChange(newSelection);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-gray-300 rounded-lg shadow-sm px-4 py-2 text-left flex items-center justify-between"
            >
                <span className="text-gray-700">
                    {selectedOptions.length === 0 ? "Select charts to display" : `${selectedOptions.length} chart(s) selected`}
                </span>
                <svg className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <ul className="py-1">
                        {Object.entries(options).map(([key, value]) => (
                            <li key={key} className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleToggle(key)}>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedOptions.includes(key)}
                                        onChange={() => { }} // The parent onClick handles the logic
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-gray-800">{value}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

window.MultiSelectDropdown = MultiSelectDropdown;
