import React, { useState, useContext } from 'react';
import { FormConfigContext } from '../context/FormConfigContext';
import { DashboardLayout } from '../components/DashboardLayout';
import ConfirmationModal from '../components/ConfirmationModal';

const AdminConfig = () => {
    const { formConfig, saveFormConfig, defaultFormConfig } = useContext(FormConfigContext);
    const [config, setConfig] = useState(formConfig);
    const [message, setMessage] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); // To store action details

    const handleRemoveClick = (id) => {
        setConfirmAction({ type: 'remove', id });
        setShowConfirmModal(true);
    };

    const handleAddClick = () => {
        setConfirmAction({ type: 'add' });
        setShowConfirmModal(true);
    };

    const handleConfirm = () => {
        if (confirmAction?.type === 'add') {
            const newField = {
                id: Date.now(),
                name: `customField${Date.now()}`,
                label: 'New Field',
                type: 'text',
                required: false,
                options: [],
                className: ''
            };
            setConfig(prev => [...prev, newField]);
        } else if (confirmAction?.type === 'remove') {
            setConfig(prev => prev.filter(field => field.id !== confirmAction.id));
        }
        setShowConfirmModal(false);
        setConfirmAction(null);
    };

    const handleFieldChange = (id, field, value) => {
        setConfig(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleOptionsChange = (id, value) => {
        const optionsArray = value.split(',').map(opt => opt.trim());
        handleFieldChange(id, 'options', optionsArray);
    };

    const moveField = (index, direction) => {
        const newConfig = [...config];
        const [field] = newConfig.splice(index, 1);
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex <= newConfig.length) {
            newConfig.splice(newIndex, 0, field);
            setConfig(newConfig);
        }
    };

    const handleSave = () => {
        saveFormConfig(config);
        setMessage('Configuration saved successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset the form to its default configuration? All your changes will be lost.")) {
            setConfig(defaultFormConfig);
            saveFormConfig(defaultFormConfig);
            setMessage('Configuration has been reset to default.');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <DashboardLayout>
            <ConfirmationModal
                show={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirm}
                title={`Confirm ${confirmAction?.type === 'add' ? 'Addition' : 'Deletion'}`}
            >
                <p>Are you sure you want to {confirmAction?.type} this field?</p>
            </ConfirmationModal>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Form Configuration</h2>
                        <p className="text-gray-500">Drag, drop, and edit fields to build the idea submission form.</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={handleReset} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition">Reset to Default</button>
                        <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition">Save Configuration</button>
                    </div>
                </div>

                {message && <div className={`p-4 mb-6 rounded-lg bg-green-100 text-green-700`}><p>{message}</p></div>}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {config.map((field, index) => (
                        <div key={field.id} className="group p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 flex flex-col space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                <h3 className="font-bold text-lg text-gray-800 flex-grow truncate pr-4">{field.label || 'New Field'}</h3>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button onClick={() => moveField(index, -1)} disabled={index === 0} className="p-1 disabled:opacity-50 text-gray-500 hover:text-black" title="Move Up">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                                    </button>
                                    <button onClick={() => moveField(index, 1)} disabled={index === config.length - 1} className="p-1 disabled:opacity-50 text-gray-500 hover:text-black" title="Move Down">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </button>
                                    <button onClick={() => handleRemoveClick(field.id)} className="text-red-500 hover:text-red-700 p-1" title="Remove Field">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Label</label>
                                    <input type="text" value={field.label} onChange={e => handleFieldChange(field.id, 'label', e.target.value)} className="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Field Type</label>
                                    <select value={field.type} onChange={e => handleFieldChange(field.id, 'type', e.target.value)} className="mt-1 p-2 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                        <option value="text">Text</option>
                                        <option value="textarea">Text Area</option>
                                        <option value="dropdown">Dropdown</option>
                                        <option value="radio">Radio Buttons</option>
                                    </select>
                                </div>
                            </div>
                            {(field.type === 'dropdown' || field.type === 'radio') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Options (comma-separated)</label>
                                    <input type="text" value={field.options.join(', ')} onChange={e => handleOptionsChange(field.id, e.target.value)} className="mt-1 p-2 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                            )}
                            <div className="flex items-center">
                                <input type="checkbox" checked={field.required} onChange={e => handleFieldChange(field.id, 'required', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2" />
                                <label className="text-sm font-medium text-gray-700">Required</label>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition">Add Field</button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminConfig;
