import { Input } from '@/client/components/ui/Input';
import type { RuntimeProps } from '@/client/components/fields/types';

export const InputRuntime = ({ name, placeholder, required, value, onChange }: RuntimeProps) => (
    <Input
        type="text"
        name={name}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
    />
);
