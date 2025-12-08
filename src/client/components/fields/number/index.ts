// Number Field - Barrel Export
import { Hash } from 'lucide-react';
export { NumberPreview } from './preview';
export { NumberRuntime } from './runtime';
export { numberProperties } from './properties';

export const numberConfig = {
    type: 'number' as const,
    label: 'Number',
    icon: Hash,
};
