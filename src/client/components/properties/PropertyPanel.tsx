import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

import { getFieldProperties, getFieldConfig, type FieldType } from '@/client/components/fields';
import { PropertyInput } from '@/client/components/properties/PropertyInput';
import { groupProperties, sortGroups } from '@/client/components/properties/utils';
import { RuleBuilder } from '@/client/components/properties/RuleBuilder';
import { AccordionItem } from '@/client/components/ui/Accordion';
import { useCanvasStore } from '@/client/store/canvasStore';
import type { FormElement } from '@/client/store/formStore';
import type { PropertyConfig } from '@/client/components/fields/types';

export const PropertyPanel = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [selectedElement, setSelectedElement] = useState<FormElement | null>(null);
    const [allElements, setAllElements] = useState<FormElement[]>([]);

    const getActiveNodeStore = useCanvasStore(state => state.getActiveNodeStore);
    const activeNodeId = useCanvasStore(state => state.activeNodeId);

    useEffect(() => {
        const activeStore = getActiveNodeStore();
        if (!activeStore) {
            setSelectedElement(null);
            setAllElements([]);
            return;
        }

        const state = activeStore.getState();
        setSelectedElement(state.getSelectedElement());
        setAllElements(state.elements);

        const unsubscribe = activeStore.subscribe((newState) => {
            setSelectedElement(newState.getSelectedElement());
            setAllElements(newState.elements);
        });

        return unsubscribe;
    }, [activeNodeId, getActiveNodeStore]);

    const hasSelection = !!selectedElement;

    const fieldConfig = hasSelection ? getFieldConfig(selectedElement.type as FieldType) : null;
    const properties = hasSelection ? getFieldProperties(selectedElement.type as FieldType) : [];
    const groupedProperties = groupProperties(properties);
    const sortedGroups = sortGroups(Object.keys(groupedProperties));
    const Icon = fieldConfig?.icon;

    const handlePropertyChange = (key: string, value: unknown) => {
        const activeStore = getActiveNodeStore();
        if (activeStore && selectedElement) {
            activeStore.getState().updateElementProperty(selectedElement.id, key, value);
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

            {!isCollapsed && hasSelection && selectedElement && (
                <div className="flex-1 overflow-y-auto">
                    {sortedGroups.map(group => (
                        <AccordionItem key={group} title={group} defaultOpen>
                            <div className="space-y-3">
                                {groupedProperties[group]?.map(prop => (
                                    <PropertyRow
                                        key={prop.key}
                                        config={prop}
                                        element={selectedElement}
                                        onPropertyChange={handlePropertyChange}
                                    />
                                ))}
                            </div>
                        </AccordionItem>
                    ))}

                    <AccordionItem title="Visibility Rules">
                        <RuleBuilder
                            element={selectedElement as any}
                            allElements={allElements as any}
                            onUpdate={handlePropertyChange}
                        />
                    </AccordionItem>
                </div>
            )}
        </div>
    );
};

const PropertyRow = ({
    config,
    element,
    onPropertyChange
}: {
    config: PropertyConfig;
    element: FormElement;
    onPropertyChange: (key: string, value: unknown) => void;
}) => {
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