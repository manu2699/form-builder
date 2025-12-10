// Form store - Pure Zustand store and types only
import { createStore, type StoreApi } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { VisibilityRule } from '@/client/lib/visibilityRules';

// Types
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
    _lastSavedElements: string;

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

export type FormNodeStoreApi = StoreApi<FormState>;

// Store factory
export const createFormStore = (formId: string, initialElements: FormElement[] = []): FormNodeStoreApi => {
    return createStore<FormState>()(
        subscribeWithSelector((set, get) => ({
            formId,
            elements: initialElements,
            selectedElementId: null,
            _lastSavedElements: JSON.stringify(initialElements),

            addElement: (type: FieldType) => set((state) => {
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
