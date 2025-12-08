// Button Field - Barrel Export
import { Square } from 'lucide-react';
export { ButtonPreview } from './preview';
export { ButtonRuntime } from './runtime';
export { buttonProperties } from './properties';

export const buttonConfig = {
    type: 'button' as const,
    label: 'Button',
    icon: Square,
};
