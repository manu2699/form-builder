import { useEffect } from 'react';

import { FormNodeWrapper } from './FormNode';
import { FormStoreProvider, useFormStoreApi } from './FormStoreProvider';
import type { FormElement } from '@/client/store/formStore';
import { useCanvasStore } from '@/client/store/canvasStore';

interface FormNodeWithStoreProps {
    id: string;
    formId: string;
    title: string;
    position: { x: number; y: number };
    initialElements?: FormElement[];
    isSelected?: boolean;
    onSelect?: () => void;
    onPositionChange?: (position: { x: number; y: number }) => void;
}

const StoreRegistrar = ({ nodeId }: { nodeId: string }) => {
    const store = useFormStoreApi();

    useEffect(() => {
        useCanvasStore.getState().registerNodeStore(nodeId, store);
        return () => useCanvasStore.getState().unregisterNodeStore(nodeId);
    }, [nodeId, store]);

    return null;
};

export const FormNodeWithStore = ({ id, formId, initialElements = [], ...props }: FormNodeWithStoreProps) => {
    return (
        <FormStoreProvider formId={formId} initialElements={initialElements}>
            <StoreRegistrar nodeId={id} />
            <FormNodeWrapper id={id} formId={formId} {...props} />
        </FormStoreProvider>
    );
};
