import type { FieldProps } from '@/client/components/fields/types';

export const ButtonPreview = ({ label = 'Button' }: FieldProps) => (
    <button disabled className="px-4 py-2 bg-black text-white">
        {label}
    </button>
);
