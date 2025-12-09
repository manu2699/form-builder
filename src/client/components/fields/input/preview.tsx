import { Input } from '@/client/components/ui/Input';
import type { FieldProps } from '@/client/components/fields/types';

export const InputPreview = ({ placeholder = 'Enter text...' }: FieldProps) => (
    <Input
        type="text"
        placeholder={placeholder}
        disabled
    />
);
