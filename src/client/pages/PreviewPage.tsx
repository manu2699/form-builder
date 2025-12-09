import { useEffect, useState, useMemo } from 'react';

import { useParams, Link } from 'react-router-dom';

import { renderFieldRuntime, type FieldType } from '@/client/components/fields';
import { Button } from '@/client/components/ui/Button';
import { evaluateRulesForElement, type VisibilityRule } from '@/client/lib/visibilityRules';

interface FormElement {
    id: string;
    type: FieldType;
    label: string;
    placeholder?: string;
    required?: boolean;
    colSpan: 1 | 2 | 3;
    properties: Record<string, unknown>;
    visibilityRules?: VisibilityRule[];
}

interface Form {
    id: string;
    name: string;
    layout: string | FormElement[];
    schema: unknown;
}

export const PreviewPage = () => {
    const { formId } = useParams();
    const [form, setForm] = useState<Form | null>(null);
    const [elements, setElements] = useState<FormElement[]>([]);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (formId) {
            fetchForm(formId);
        }
    }, [formId]);

    const fetchForm = async (id: string) => {
        try {
            const res = await fetch(`/api/forms/${id}`);
            if (!res.ok) throw new Error('Form not found');
            const data = await res.json();
            setForm(data);

            if (data.layout) {
                const layoutData = typeof data.layout === 'string'
                    ? JSON.parse(data.layout)
                    : data.layout;
                setElements(Array.isArray(layoutData) ? layoutData : []);
            }
        } catch (err) {
            console.error('Failed to load form:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (elementId: string, value: string) => {
        setFormData(prev => ({ ...prev, [elementId]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        setSubmitted(true);
    };

    // Compute visibility/enabled state for each element based on rules
    const elementStates = useMemo(() => {
        const states: Record<string, { visible: boolean; enabled: boolean }> = {};
        for (const element of elements) {
            states[element.id] = evaluateRulesForElement(element.visibilityRules, formData);
        }
        return states;
    }, [elements, formData]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Loading form...</div>
            </div>
        );
    }

    if (!form) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                <div className="text-gray-500">Form not found</div>
                <Link to="/" className="text-black hover:underline">← Back to forms</Link>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                <div className="bg-white border border-gray-200 p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Form Submitted!</h2>
                    <p className="text-gray-500 mb-6">Thank you for your submission.</p>
                    <Button onClick={() => setSubmitted(false)} variant="outline">
                        Submit Another Response
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="font-bold text-lg">{form.name}</h1>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        Preview Mode
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-3xl mx-auto px-6 py-12">
                <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-8">
                    <div
                        className="grid gap-6"
                        style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
                    >
                        {elements.length === 0 ? (
                            <div className="col-span-3 text-center py-12 text-gray-400">
                                No fields added to this form yet.
                            </div>
                        ) : (
                            elements.map((element) => {
                                const state = elementStates[element.id] || { visible: true, enabled: true };

                                // Skip if not visible
                                if (!state.visible) {
                                    return null;
                                }

                                return (
                                    <div
                                        key={element.id}
                                        style={{ gridColumn: `span ${element.colSpan}` }}
                                        className={!state.enabled ? 'opacity-50 pointer-events-none' : ''}
                                    >
                                        {element.type !== 'button' && (
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {element.label}
                                                {element.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                        )}
                                        {renderFieldRuntime(element.type, {
                                            name: element.id,
                                            label: element.label,
                                            placeholder: element.placeholder,
                                            required: element.required,
                                            value: formData[element.id] || '',
                                            onChange: (value) => handleInputChange(element.id, value),
                                        })}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};
