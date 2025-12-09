// Form Store Provider - React context wrapper with autosave and real-time sync
import { createContext, useContext, useRef, type ReactNode } from 'react';
import { useStore } from 'zustand';

import { createFormStore, type FormNodeStoreApi, type FormState, type FormElement } from '@/client/store/formStore';
import { useAutosave } from './useAutosave';
import { useYjsSync } from './useYjsSync';

const FormStoreContext = createContext<FormNodeStoreApi | null>(null);

interface FormStoreProviderProps {
    formId: string;
    initialElements?: FormElement[];
    children: ReactNode;
}

export const FormStoreProvider = ({ formId, initialElements = [], children }: FormStoreProviderProps) => {
    const storeRef = useRef<FormNodeStoreApi | null>(null);

    if (!storeRef.current) {
        storeRef.current = createFormStore(formId, initialElements);
    }

    useAutosave(storeRef.current, formId);
    useYjsSync(storeRef.current, formId);

    return (
        <FormStoreContext.Provider value={storeRef.current}>
            {children}
        </FormStoreContext.Provider>
    );
};

export const useFormStore = <T,>(selector: (state: FormState) => T): T => {
    const store = useContext(FormStoreContext);
    if (!store) {
        throw new Error('useFormStore must be used within FormStoreProvider');
    }
    return useStore(store, selector);
};

export const useFormStoreApi = (): FormNodeStoreApi => {
    const store = useContext(FormStoreContext);
    if (!store) {
        throw new Error('useFormStoreApi must be used within FormStoreProvider');
    }
    return store;
};
