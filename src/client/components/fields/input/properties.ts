import type { PropertyConfig } from '@/client/components/fields/types';

export const inputProperties: PropertyConfig[] = [
    // Basic group
    {
        key: 'label',
        label: 'Label',
        type: 'text',
        placeholder: 'Enter label...',
        defaultValue: 'Text Input',
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
    // Advanced group
    {
        key: 'inputType',
        label: 'Input Type',
        type: 'select',
        options: [
            { value: 'text', label: 'Text' },
            { value: 'email', label: 'Email' },
            { value: 'tel', label: 'Phone' },
            { value: 'url', label: 'URL' },
            { value: 'password', label: 'Password' },
        ],
        defaultValue: 'text',
        group: 'Advanced',
    },
    {
        key: 'maxLength',
        label: 'Max Length',
        type: 'number',
        min: 0,
        max: 1000,
        placeholder: 'No limit',
        group: 'Validation',
    },
];
