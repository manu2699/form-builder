import type { FieldProps } from '@/client/components/fields/types';

export const InputPreview = ({ placeholder = 'Input field' }: FieldProps) => (
    <input
        type="text"
        disabled
        className="w-full px-3 py-2 border border-gray-300 bg-gray-50"
        placeholder={placeholder}
    />
);
