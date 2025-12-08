import type { FC } from 'react';

import type { FieldProps, RuntimeProps, PropertyConfig, FieldType, FieldConfig } from '@/client/components/fields/types';
import { inputConfig, InputPreview, InputRuntime, inputProperties } from '@/client/components/fields/input';
import { numberConfig, NumberPreview, NumberRuntime, numberProperties } from '@/client/components/fields/number';
import { buttonConfig, ButtonPreview, ButtonRuntime, buttonProperties } from '@/client/components/fields/button';


export type { FieldProps, RuntimeProps, PropertyConfig, FieldType, FieldConfig };

export const FIELD_CONFIGS: Record<FieldType, FieldConfig> = {
    input: inputConfig,
    number: numberConfig,
    button: buttonConfig,
};

export const PREVIEW_COMPONENTS: Record<FieldType, FC<FieldProps>> = {
    input: InputPreview,
    number: NumberPreview,
    button: ButtonPreview,
};

export const RUNTIME_COMPONENTS: Record<FieldType, FC<RuntimeProps>> = {
    input: InputRuntime,
    number: NumberRuntime,
    button: ButtonRuntime,
};

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
