import { Input } from '@/client/components/ui/Input';
import type { FieldProps } from '@/client/components/fields/types';

export const NumberPreview = ({ placeholder = '0' }: FieldProps) => (
    <Input
        type="number"
        placeholder={placeholder}
        disabled
    />
);
