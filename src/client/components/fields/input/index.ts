// Input Field - Barrel Export
import { Type } from 'lucide-react';
export { InputPreview } from './preview';
export { InputRuntime } from './runtime';
export { inputProperties } from './properties';

export const inputConfig = {
    type: 'input' as const,
    label: 'Text Input',
    icon: Type,
};
