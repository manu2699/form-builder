// Dynamic Property Panel - Renders based on field's properties.ts config
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Eye } from 'lucide-react';
import { useBuilderStore } from '../../store/builderStore';
import { getFieldProperties, getFieldConfig, type FieldType } from '../fields';
import { Accordion, AccordionItem } from '../ui/Accordion';
import { PropertyRow } from './PropertyRow';
import { RuleBuilder } from './RuleBuilder';
import { groupProperties, sortGroups } from './utils';

export const PropertyPanel = () => {
    const { selectedElementId, elements } = useBuilderStore();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const selectedElement = elements.find(e => e.id === selectedElementId);

    // Always render panel, but show collapsed state when no element selected
    const hasSelection = !!selectedElement;

    // Get field config if element is selected
    const fieldConfig = hasSelection ? getFieldConfig(selectedElement.type as FieldType) : null;
    const properties = hasSelection ? getFieldProperties(selectedElement.type as FieldType) : [];
    const groupedProperties = groupProperties(properties);
    const sortedGroups = sortGroups(Object.keys(groupedProperties));
    const Icon = fieldConfig?.icon;

    // Count active rules for badge
    const activeRulesCount = selectedElement?.visibilityRules?.filter(r => r.enabled).length ?? 0;

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
                {/* Collapse toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 shrink-0"
                    title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
                >
                    {isCollapsed || !hasSelection ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>

                {/* Title - only show when expanded */}
                {!isCollapsed && hasSelection && (
                    <div className="flex items-center gap-2 overflow-hidden">
                        {Icon && <Icon size={16} className="text-gray-500 shrink-0" />}
                        <span className="text-sm font-medium truncate">{fieldConfig?.label}</span>
                    </div>
                )}
            </div>

            {/* Properties with Accordion - only show when expanded and has selection */}
            {!isCollapsed && hasSelection && (
                <div className="flex-1 overflow-y-auto">
                    <Accordion>
                        {/* Standard property groups */}
                        {sortedGroups.map((groupName, index) => (
                            <AccordionItem
                                key={groupName}
                                title={groupName}
                                defaultOpen={index === 0}
                            >
                                <div className="space-y-2">
                                    {(groupedProperties[groupName] || []).map((prop) => (
                                        <PropertyRow key={prop.key} config={prop} element={selectedElement} />
                                    ))}
                                </div>
                            </AccordionItem>
                        ))}

                        {/* Visibility Rules section */}
                        <AccordionItem
                            title={`Visibility Rules${activeRulesCount > 0 ? ` (${activeRulesCount})` : ''}`}
                            defaultOpen={false}
                        >
                            <RuleBuilder element={selectedElement} />
                        </AccordionItem>
                    </Accordion>
                </div>
            )}

            {/* Collapsed state message */}
            {(isCollapsed || !hasSelection) && (
                <div className="flex-1 flex items-center justify-center">
                    <span
                        className="text-xs text-gray-400 writing-mode-vertical transform rotate-180"
                        style={{ writingMode: 'vertical-rl' }}
                    >
                        {hasSelection ? 'Properties' : 'Select element'}
                    </span>
                </div>
            )}
        </div>
    );
};
