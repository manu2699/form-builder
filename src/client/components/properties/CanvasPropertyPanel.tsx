// Canvas Property Panel - Uses the active node's store instead of global store
import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';

import { getFieldProperties, getFieldConfig, type FieldType } from '@/client/components/fields';
import { PropertyInput } from '@/client/components/properties/PropertyInput';
import { groupProperties, sortGroups } from '@/client/components/properties/utils';
import { getActiveNodeStore } from '@/client/pages/HyperFormsPage';
import type { FormElement } from '@/client/store/formStore';
import type { PropertyConfig } from '@/client/components/fields/types';

// Simple accordion item component for this panel
const PanelAccordionItem = ({
    title,
    children,
    defaultOpen = true
}: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-100 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {title}
                </span>
                <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            {isOpen && (
                <div className="p-3 pb-4 px-4">
                    {children}
                </div>
            )}
        </div>
    );
};

// Property row component that uses the canvas store
const CanvasPropertyRow = ({
    config,
    element,
    onPropertyChange
}: {
    config: PropertyConfig;
    element: FormElement;
    onPropertyChange: (key: string, value: unknown) => void;
}) => {
    // Get value from element - check top-level first, then properties
    const value = config.key in element
        ? element[config.key as keyof FormElement]
        : element.properties?.[config.key];

    const handleChange = (newValue: unknown) => {
        onPropertyChange(config.key, newValue);
    };

    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-600">
                {config.label}
            </label>
            <PropertyInput config={config} value={value} onChange={handleChange} />
            {config.description && (
                <p className="text-xs text-gray-400">{config.description}</p>
            )}
        </div>
    );
};

export const CanvasPropertyPanel = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [selectedElement, setSelectedElement] = useState<FormElement | null>(null);

    // Poll for updates from the active node's store
    // This is simpler than trying to subscribe to an external store
    useEffect(() => {
        const interval = setInterval(() => {
            const store = getActiveNodeStore();
            if (store) {
                const state = store.getState();
                const element = state.getSelectedElement();
                setSelectedElement(element);
            } else {
                setSelectedElement(null);
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const hasSelection = !!selectedElement;

    // Get field config if element is selected
    const fieldConfig = hasSelection ? getFieldConfig(selectedElement.type as FieldType) : null;
    const properties = hasSelection ? getFieldProperties(selectedElement.type as FieldType) : [];
    const groupedProperties = groupProperties(properties);
    const sortedGroups = sortGroups(Object.keys(groupedProperties));
    const Icon = fieldConfig?.icon;

    // Handle property change
    const handlePropertyChange = (key: string, value: unknown) => {
        const store = getActiveNodeStore();
        if (store && selectedElement) {
            store.getState().updateElementProperty(selectedElement.id, key, value);
        }
    };

    if (!isCollapsed && !hasSelection) {
        return null;
    }

    return (
        <div
            className={`
                bg-white border-l border-gray-200 h-full flex flex-col shrink-0 
                transition-all duration-300 ease-in-out overflow-hidden
                ${isCollapsed || !hasSelection ? 'w-12' : 'w-80'}
            `}
        >
            {/* Header */}
            <div className="p-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 shrink-0"
                    title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
                >
                    {isCollapsed || !hasSelection ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>

                {!isCollapsed && hasSelection && (
                    <div className="flex items-center gap-2 overflow-hidden">
                        {Icon && <Icon size={16} className="text-gray-500 shrink-0" />}
                        <span className="text-sm font-medium truncate">{fieldConfig?.label}</span>
                    </div>
                )}
            </div>

            {/* Properties */}
            {!isCollapsed && hasSelection && selectedElement && (
                <div className="flex-1 overflow-y-auto">
                    {sortedGroups.map(group => (
                        <PanelAccordionItem key={group} title={group}>
                            <div className="space-y-3">
                                {groupedProperties[group]?.map(prop => (
                                    <CanvasPropertyRow
                                        key={prop.key}
                                        config={prop}
                                        element={selectedElement}
                                        onPropertyChange={handlePropertyChange}
                                    />
                                ))}
                            </div>
                        </PanelAccordionItem>
                    ))}
                </div>
            )}
        </div>
    );
};
