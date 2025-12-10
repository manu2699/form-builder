import { Type } from 'lucide-react';

export { InputPreview } from '@/client/components/fields/input/preview';
export { InputRuntime } from '@/client/components/fields/input/runtime';
export { inputProperties } from '@/client/components/fields/input/properties';

export const inputConfig = {
    type: 'input' as const,
    label: 'Text Input',
    icon: Type,
};
