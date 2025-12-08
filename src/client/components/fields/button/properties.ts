import type { PropertyConfig } from '@/client/components/fields/types';

export const buttonProperties: PropertyConfig[] = [
    {
        key: 'label',
        label: 'Button Text',
        type: 'text',
        placeholder: 'Enter button text...',
        defaultValue: 'Submit',
        group: 'Basic',
    },
    {
        key: 'buttonType',
        label: 'Button Type',
        type: 'select',
        options: [
            { value: 'submit', label: 'Submit' },
            { value: 'button', label: 'Button' },
            { value: 'reset', label: 'Reset' },
        ],
        defaultValue: 'submit',
        group: 'Basic',
    },
    {
        key: 'variant',
        label: 'Style',
        type: 'select',
        options: [
            { value: 'primary', label: 'Primary (Black)' },
            { value: 'secondary', label: 'Secondary (Gray)' },
            { value: 'outline', label: 'Outline' },
        ],
        defaultValue: 'primary',
        group: 'Appearance',
    },
    {
        key: 'fullWidth',
        label: 'Full Width',
        type: 'checkbox',
        defaultValue: false,
        group: 'Appearance',
    },
];
