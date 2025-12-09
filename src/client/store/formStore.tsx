// Per-Form Store Context - Each form node gets its own store instance with autosave
import { createContext, useContext, useRef, useEffect, type ReactNode } from 'react';
import { createStore, useStore, type StoreApi } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { VisibilityRule } from '@/client/lib/visibilityRules';

export type FieldType = 'input' | 'number' | 'button';

export type FormElement = {
    id: string;
    type: FieldType;
    label: string;
    placeholder?: string;
    required?: boolean;
    colSpan: 1 | 2 | 3;
    properties: Record<string, unknown>;
    visibilityRules?: VisibilityRule[];
};

export interface FormState {
    formId: string;
    elements: FormElement[];
    selectedElementId: string | null;
    _lastSavedElements: string; // JSON string for comparison

    // Actions
    addElement: (type: FieldType) => void;
    removeElement: (id: string) => void;
    resizeElement: (id: string, colSpan: 1 | 2 | 3) => void;
    reorderElements: (fromIndex: number, toIndex: number) => void;
    updateElementProperty: (id: string, key: string, value: unknown) => void;
    setElements: (elements: FormElement[]) => void;
    selectElement: (id: string | null) => void;
    getSelectedElement: () => FormElement | null;
    markSaved: () => void;
}

// Create a store for a specific form
export const createFormStore = (formId: string, initialElements: FormElement[] = []) => {
    return createStore<FormState>()(
        subscribeWithSelector((set, get) => ({
            formId,
            elements: initialElements,
            selectedElementId: null,
            _lastSavedElements: JSON.stringify(initialElements),

            addElement: (type) => set((state) => {
                const newElement: FormElement = {
                    id: nanoid(),
                    type,
                    label: type.charAt(0).toUpperCase() + type.slice(1),
                    colSpan: 1,
                    properties: {},
                };
                return {
                    elements: [...state.elements, newElement],
                    selectedElementId: newElement.id,
                };
            }),

            removeElement: (id) => set((state) => ({
                elements: state.elements.filter(e => e.id !== id),
                selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
            })),

            resizeElement: (id, colSpan) => set((state) => ({
                elements: state.elements.map(e =>
                    e.id === id ? { ...e, colSpan } : e
                ),
            })),

            reorderElements: (fromIndex, toIndex) => set((state) => {
                const elements = [...state.elements];
                const [removed] = elements.splice(fromIndex, 1);
                if (removed) {
                    elements.splice(toIndex, 0, removed);
                }
                return { elements };
            }),

            updateElementProperty: (id, key, value) => set((state) => ({
                elements: state.elements.map(e =>
                    e.id === id
                        ? {
                            ...e,
                            ...(key === 'label' || key === 'placeholder' || key === 'required' || key === 'visibilityRules'
                                ? { [key]: value }
                                : { properties: { ...e.properties, [key]: value } }
                            )
                        }
                        : e
                ),
            })),

            setElements: (elements) => set({
                elements,
                _lastSavedElements: JSON.stringify(elements),
            }),

            selectElement: (id) => set({ selectedElementId: id }),

            getSelectedElement: () => {
                const state = get();
                return state.elements.find(e => e.id === state.selectedElementId) || null;
            },

            markSaved: () => set((state) => ({
                _lastSavedElements: JSON.stringify(state.elements),
            })),
        }))
    );
};

// Context for the form store
export type FormNodeStoreApi = StoreApi<FormState>;
const FormStoreContext = createContext<FormNodeStoreApi | null>(null);

// Provider component with autosave
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

    // Autosave subscription
    useEffect(() => {
        const store = storeRef.current;
        if (!store) return;

        let saveTimer: NodeJS.Timeout | null = null;

        const saveForm = async () => {
            const { elements, markSaved } = store.getState();
            try {
                await fetch(`/api/forms/${formId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ elements }),
                });
                markSaved();
                console.log(`✅ Auto-saved: ${formId}`);
            } catch (err) {
                console.error(`❌ Auto-save failed: ${formId}`, err);
            }
        };

        const unsubscribe = store.subscribe((state, prevState) => {
            const current = JSON.stringify(state.elements);
            const saved = state._lastSavedElements;
            if (current === saved) return;

            if (saveTimer) clearTimeout(saveTimer);
            saveTimer = setTimeout(saveForm, 2000);
        });

        return () => {
            unsubscribe();
            if (saveTimer) clearTimeout(saveTimer);
        };
    }, [formId]);

    return (
        <FormStoreContext.Provider value={storeRef.current}>
            {children}
        </FormStoreContext.Provider>
    );
};

// Hook to use the form store
export const useFormStore = <T,>(selector: (state: FormState) => T): T => {
    const store = useContext(FormStoreContext);
    if (!store) {
        throw new Error('useFormStore must be used within FormStoreProvider');
    }
    return useStore(store, selector);
};

// Hook to get the store API directly (for advanced usage)
export const useFormStoreApi = (): FormNodeStoreApi => {
    const store = useContext(FormStoreContext);
    if (!store) {
        throw new Error('useFormStoreApi must be used within FormStoreProvider');
    }
    return store;
};
