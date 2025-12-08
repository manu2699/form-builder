// Number Field - Properties Configuration
import type { PropertyConfig } from '../types';

export const numberProperties: PropertyConfig[] = [
    {
        key: 'label',
        label: 'Label',
        type: 'text',
        placeholder: 'Enter label...',
        defaultValue: 'Number',
        group: 'Basic',
    },
    {
        key: 'placeholder',
        label: 'Placeholder',
        type: 'text',
        placeholder: 'Enter placeholder...',
        defaultValue: '',
        group: 'Basic',
    },
    {
        key: 'required',
        label: 'Required',
        type: 'checkbox',
        defaultValue: false,
        group: 'Validation',
    },
    {
        key: 'min',
        label: 'Minimum',
        type: 'number',
        placeholder: 'No minimum',
        group: 'Validation',
    },
    {
        key: 'max',
        label: 'Maximum',
        type: 'number',
        placeholder: 'No maximum',
        group: 'Validation',
    },
    {
        key: 'step',
        label: 'Step',
        type: 'number',
        min: 0,
        defaultValue: 1,
        group: 'Advanced',
        description: 'Increment/decrement step value',
    },
];
