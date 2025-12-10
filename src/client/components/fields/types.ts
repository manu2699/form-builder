// Shared Types for Field Components
import type { LucideIcon } from 'lucide-react';

// Props for Preview components (builder mode)
export interface FieldProps {
    label?: string;
    placeholder?: string;
}

// Props for Runtime components (live forms)
export interface RuntimeProps {
    name: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    value?: string;
    onChange?: (value: string) => void;
}

// Property input types
export type PropertyType =
    | 'text'
    | 'number'
    | 'checkbox'
    | 'select'
    | 'textarea'
    | 'color';

// Property configuration for property panel
export interface PropertyConfig {
    key: string;         
    label: string;    
    type: PropertyType;  
    placeholder?: string;
    options?: { value: string; label: string }[];  // For select type
    defaultValue?: any;
    min?: number;          // For number type
    max?: number;          // For number type
    step?: number;         // For number type
    rows?: number;         // For textarea type
    group?: string;        // Group name for organizing properties
    description?: string;  // Help text
}

// Field configuration
export interface FieldConfig {
    type: string;
    label: string;
    icon: LucideIcon;
}

export type FieldType = 'input' | 'number' | 'button';
