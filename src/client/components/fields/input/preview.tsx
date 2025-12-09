import { Input } from '@/client/components/ui/Input';
import type { FieldProps } from '@/client/components/fields/types';

export const InputPreview = ({ placeholder = 'Enter text...', name, required }: FieldProps) => (
    <Input
        type="text"
        name={name}
        required={required}
        placeholder={placeholder}
        disabled
    />
);
