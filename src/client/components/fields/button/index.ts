import { Square } from 'lucide-react';

export { ButtonPreview } from '@/client/components/fields/button/preview';
export { ButtonRuntime } from '@/client/components/fields/button/runtime';
export { buttonProperties } from '@/client/components/fields/button/properties';

export const buttonConfig = {
    type: 'button' as const,
    label: 'Button',
    icon: Square,
};
