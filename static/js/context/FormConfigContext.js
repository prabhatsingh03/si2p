import { createContext, useState, useEffect } from 'react';

export const FormConfigContext = createContext(null);

export const defaultFormConfig = [
    { id: 1, name: 'employeeName', label: 'Employee Name', type: 'text', required: true, className: '' },
    { id: 2, name: 'company', label: 'Company', type: 'dropdown', required: true, options: ['Simon India Ltd', 'Zuari Management Services Ltd', 'Zuari Agro Chemicals Ltd', 'Paradeep Phosphates Ltd'], className: '' },
    { id: 3, name: 'ideaTitle', label: 'Idea Title', type: 'text', required: true, placeholder: 'e.g., Automated Customer Support Chatbot', className: 'md:col-span-2' },
    { id: 4, name: 'ideaCategory', label: 'Idea Category', type: 'dropdown', required: true, options: ['AI Leadership / Thought Leadership', 'Productivity Enhancement Tools', 'Optimization'], className: '' },
    { id: 5, name: 'departmentsImpacted', label: 'Department Impacted', type: 'dropdown', required: true, options: ['Finance', 'HR', 'Operations', 'Sales', 'IT', 'Supply Chain'], className: '' },
    { id: 6, name: 'problemStatement', label: 'Problem Statement', type: 'textarea', required: true, placeholder: 'Describe the current problem.', className: 'md:col-span-2' },
    { id: 7, name: 'proposedSolution', label: 'Proposed Solution', type: 'textarea', required: true, placeholder: 'Describe your proposed solution.', className: 'md:col-span-2' },
    { id: 8, name: 'expectedBenefits', label: 'Expected Benefits / ROI', type: 'textarea', required: true, placeholder: 'e.g., Cost savings, efficiency gains.', className: 'md:col-span-2' },
    { id: 9, name: 'availabilityOfData', label: 'Availability of Data', type: 'radio', required: true, options: ['Yes', 'No'], className: 'md:col-span-2' },
    { id: 10, name: 'dataSources', label: 'Data Sources', type: 'textarea', required: true, placeholder: 'Describe the data sources.', dependsOn: 'availabilityOfData', dependsOnValue: 'Yes', className: '' },
    { id: 11, name: 'estimatedCost', label: 'Estimated Cost / Resource Need', type: 'textarea', required: true, placeholder: 'e.g., Software licenses, personnel.', className: 'md:col-span-2' },
    { id: 12, name: 'implementationTimeline', label: 'Estimated Implementation Timeline', type: 'dropdown', required: true, options: ['0–3 months', '3–6 months', '6–12 months', '12+ months'], className: '' },
];

export const FormConfigProvider = ({ children }) => {
    const [formConfig, setFormConfig] = useState(() => {
        try {
            const savedConfig = localStorage.getItem('formConfig');
            return savedConfig ? JSON.parse(savedConfig) : defaultFormConfig;
        } catch (error) {
            console.error("Failed to parse form config from localStorage", error);
            return defaultFormConfig;
        }
    });

    const saveFormConfig = (newConfig) => {
        localStorage.setItem('formConfig', JSON.stringify(newConfig));
        setFormConfig(newConfig);
    };

    const value = { formConfig, saveFormConfig, defaultFormConfig };

    return <FormConfigContext.Provider value={value}>{children}</FormConfigContext.Provider>;
};
