// Property Input Renderers - Using shared UI components
import { Input, Select, Textarea, Checkbox } from '@/client/components/ui/Input';
import type { PropertyConfig } from '@/client/components/fields/types';

interface PropertyInputProps {
    config: PropertyConfig;
    value: any;
    onChange: (value: any) => void;
}

export const PropertyInput = ({ config, value, onChange }: PropertyInputProps) => {
    switch (config.type) {
        case 'text':
            return (
                <Input
                    type="text"
                    value={value ?? config.defaultValue ?? ''}
                    onChange={onChange}
                    placeholder={config.placeholder}
                />
            );

        case 'number':
            return (
                <Input
                    type="number"
                    value={value ?? config.defaultValue ?? ''}
                    onChange={(v) => onChange(v ? Number(v) : undefined)}
                    placeholder={config.placeholder}
                    min={config.min}
                    max={config.max}
                    step={config.step}
                />
            );

        case 'checkbox':
            return (
                <Checkbox
                    checked={value ?? config.defaultValue ?? false}
                    onChange={onChange}
                    label="Enabled"
                />
            );

        case 'select':
            return (
                <Select
                    value={value ?? config.defaultValue ?? ''}
                    onChange={onChange}
                    options={config.options}
                />
            );

        case 'textarea':
            return (
                <Textarea
                    value={value ?? config.defaultValue ?? ''}
                    onChange={onChange}
                    placeholder={config.placeholder}
                    rows={config.rows ?? 3}
                />
            );

        case 'color':
            return (
                <input
                    type="color"
                    value={value ?? config.defaultValue ?? '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-10 border border-gray-200 cursor-pointer rounded-sm"
                />
            );

        default:
            return null;
    }
};
