// Field Registry - Central export for all field components
import type { FC } from 'react';
import type { FieldProps, RuntimeProps, PropertyConfig, FieldType, FieldConfig } from './types';

// Import only input, number, button fields
import { inputConfig, InputPreview, InputRuntime, inputProperties } from './input';
import { numberConfig, NumberPreview, NumberRuntime, numberProperties } from './number';
import { buttonConfig, ButtonPreview, ButtonRuntime, buttonProperties } from './button';

// Re-export types
export type { FieldProps, RuntimeProps, PropertyConfig, FieldType, FieldConfig };

// Field configurations registry
export const FIELD_CONFIGS: Record<FieldType, FieldConfig> = {
    input: inputConfig,
    number: numberConfig,
    button: buttonConfig,
};

// Preview components registry
export const PREVIEW_COMPONENTS: Record<FieldType, FC<FieldProps>> = {
    input: InputPreview,
    number: NumberPreview,
    button: ButtonPreview,
};

// Runtime components registry
export const RUNTIME_COMPONENTS: Record<FieldType, FC<RuntimeProps>> = {
    input: InputRuntime,
    number: NumberRuntime,
    button: ButtonRuntime,
};

// Properties registry
export const FIELD_PROPERTIES: Record<FieldType, PropertyConfig[]> = {
    input: inputProperties,
    number: numberProperties,
    button: buttonProperties,
};

// All available field types
export const FIELD_TYPES: FieldType[] = ['input', 'number', 'button'];

// Helper functions
export const renderFieldPreview = (type: FieldType, props?: FieldProps) => {
    const Component = PREVIEW_COMPONENTS[type];
    return Component ? <Component {...props} /> : null;
};

export const renderFieldRuntime = (type: FieldType, props: RuntimeProps) => {
    const Component = RUNTIME_COMPONENTS[type];
    return Component ? <Component {...props} /> : null;
};

export const getFieldProperties = (type: FieldType): PropertyConfig[] => {
    return FIELD_PROPERTIES[type] || [];
};

export const getFieldConfig = (type: FieldType): FieldConfig => {
    return FIELD_CONFIGS[type];
};
