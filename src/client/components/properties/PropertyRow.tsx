// Property Row Component
import React from 'react';
import { PropertyInput } from './PropertyInput';
import { useBuilderStore, type FormElement } from '../../store/builderStore';
import type { PropertyConfig } from '../fields/types';

interface PropertyRowProps {
    config: PropertyConfig;
    element: FormElement;
}

export const PropertyRow = ({ config, element }: PropertyRowProps) => {
    const { updateElementProperty } = useBuilderStore();

    // Get value from element - check top-level first, then properties
    const value = config.key in element
        ? (element as any)[config.key]
        : element.properties[config.key];

    const handleChange = (newValue: any) => {
        updateElementProperty(element.id, config.key, newValue);
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
