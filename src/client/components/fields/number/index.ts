import { Hash } from 'lucide-react';

export { NumberPreview } from '@/client/components/fields/number/preview';
export { NumberRuntime } from '@/client/components/fields/number/runtime';
export { numberProperties } from '@/client/components/fields/number/properties';

export const numberConfig = {
    type: 'number' as const,
    label: 'Number',
    icon: Hash,
};
