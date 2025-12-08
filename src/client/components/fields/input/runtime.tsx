import type { RuntimeProps } from '@/client/components/fields/types';

export const InputRuntime = ({ name, placeholder, required, value, onChange }: RuntimeProps) => (
    <input
        type="text"
        name={name}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
    />
);
