// FormNodeWithStore - FormNode wrapper that registers its store actions to parent
import { useEffect } from 'react';

import { FormNodeWrapper } from './FormNode';
import { FormStoreProvider, useFormStoreApi, type FormElement } from '@/client/store/formStore';
import { registerNodeStore, unregisterNodeStore } from '@/client/pages/HyperFormsPage';

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

// Inner component that registers the store
const StoreRegistrar = ({ nodeId }: { nodeId: string }) => {
    const store = useFormStoreApi();

    useEffect(() => {
        registerNodeStore(nodeId, store);
        return () => unregisterNodeStore(nodeId);
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

