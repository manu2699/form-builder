// Property Input Renderers
import React from 'react';
import type { PropertyConfig } from '@/client/components/fields/types';

interface PropertyInputProps {
    config: PropertyConfig;
    value: any;
    onChange: (value: any) => void;
}

const baseInputClass = "w-full px-3 py-2 text-sm border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors";

export const PropertyInput = ({ config, value, onChange }: PropertyInputProps) => {
    switch (config.type) {
        case 'text':
            return (
                <input
                    type="text"
                    value={value ?? config.defaultValue ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={config.placeholder}
                    className={baseInputClass}
                />
            );

        case 'number':
            return (
                <input
                    type="number"
                    value={value ?? config.defaultValue ?? ''}
                    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder={config.placeholder}
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    className={baseInputClass}
                />
            );

        case 'checkbox':
            return (
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={value ?? config.defaultValue ?? false}
                        onChange={(e) => onChange(e.target.checked)}
                        className="w-4 h-4 accent-black"
                    />
                    <span className="text-sm text-gray-600">Enabled</span>
                </label>
            );

        case 'select':
            return (
                <select
                    value={value ?? config.defaultValue ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    className={baseInputClass}
                >
                    {config.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            );

        case 'textarea':
            return (
                <textarea
                    value={value ?? config.defaultValue ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={config.placeholder}
                    rows={config.rows ?? 3}
                    className={baseInputClass}
                />
            );

        case 'color':
            return (
                <input
                    type="color"
                    value={value ?? config.defaultValue ?? '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-10 border border-gray-200 cursor-pointer"
                />
            );

        default:
            return null;
    }
};
