import { Input } from '@/client/components/ui/Input';
import type { RuntimeProps } from '@/client/components/fields/types';

export const NumberRuntime = ({ name, placeholder, required, value, onChange }: RuntimeProps) => (
    <Input
        type="number"
        name={name}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
    />
);
