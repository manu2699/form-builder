// Common Input Component
interface InputProps {
    type?: 'text' | 'number';
    name?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    value?: string | number;
    min?: number;
    max?: number;
    step?: number;
    onChange?: (value: string) => void;
    className?: string;
}

// Common styling - can be imported for custom usage
export const inputBaseStyles = `
    w-full px-3 py-2 text-sm
    border border-gray-200 rounded-sm
    bg-gray-50 
    text-gray-700
    placeholder:text-gray-400 placeholder:font-normal
    focus:bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-300 
    disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
    outline-none transition-colors
`.trim().replace(/\s+/g, ' ');

export const Input = ({
    type = 'text',
    name,
    placeholder,
    required,
    disabled,
    value,
    min,
    max,
    step,
    onChange,
    className = '',
}: InputProps) => (
    <input
        type={type}
        name={name}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`${inputBaseStyles} ${className}`}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
    />
);

// Select Component
interface SelectProps {
    value?: string;
    onChange?: (value: string) => void;
    options?: { value: string; label: string }[];
    className?: string;
}

export const Select = ({ value, onChange, options = [], className = '' }: SelectProps) => (
    <select
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        className={`${inputBaseStyles} ${className}`}
    >
        {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
                {opt.label}
            </option>
        ))}
    </select>
);

// Textarea Component
interface TextareaProps {
    value?: string;
    placeholder?: string;
    rows?: number;
    onChange?: (value: string) => void;
    className?: string;
}

export const Textarea = ({ value, placeholder, rows = 3, onChange, className = '' }: TextareaProps) => (
    <textarea
        value={value ?? ''}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange?.(e.target.value)}
        className={`${inputBaseStyles} ${className}`}
    />
);

// Checkbox Component
interface CheckboxProps {
    checked?: boolean;
    label?: string;
    onChange?: (checked: boolean) => void;
    className?: string;
}

export const Checkbox = ({ checked, label, onChange, className = '' }: CheckboxProps) => (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
        <input
            type="checkbox"
            checked={checked ?? false}
            onChange={(e) => onChange?.(e.target.checked)}
            className="w-4 h-4 accent-black"
        />
        {label && <span className="text-sm text-gray-600">{label}</span>}
    </label>
);
