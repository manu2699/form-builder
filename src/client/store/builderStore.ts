import { create } from 'zustand';
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
    properties: Record<string, any>;
    visibilityRules?: VisibilityRule[];
};

interface BuilderState {
    elements: FormElement[];
    selectedElementId: string | null;
    activeId: string | null;

    // if change is from remote
    _isRemoteUpdate: boolean;

    addElement: (type: FieldType) => void;
    removeElement: (id: string) => void;
    resizeElement: (id: string, colSpan: 1 | 2 | 3) => void;
    reorderElements: (fromIndex: number, toIndex: number) => void;
    updateElementProperty: (id: string, key: string, value: any) => void;
    setElements: (elements: FormElement[], isRemote?: boolean) => void;
    selectElement: (id: string | null) => void;
    setActiveId: (id: string | null) => void;
    getSelectedElement: () => FormElement | null;

    rows: any[];
    setRows: (rows: any[]) => void;
    gridColumns: 2 | 4 | 6 | 12;
    setGridColumns: (columns: 2 | 4 | 6 | 12) => void;
}

export const useBuilderStore = create<BuilderState>()(
    subscribeWithSelector((set, get) => ({
        elements: [],
        selectedElementId: null,
        activeId: null,
        rows: [],
        gridColumns: 4,
        _isRemoteUpdate: false,

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
                _isRemoteUpdate: false, // Local change
            };
        }),

        removeElement: (id) => set((state) => ({
            elements: state.elements.filter(e => e.id !== id),
            selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
            _isRemoteUpdate: false, // Local change
        })),

        resizeElement: (id, colSpan) => set((state) => ({
            elements: state.elements.map(e =>
                e.id === id ? { ...e, colSpan } : e
            ),
            _isRemoteUpdate: false, // Local change
        })),

        reorderElements: (fromIndex, toIndex) => set((state) => {
            const elements = [...state.elements];
            const [removed] = elements.splice(fromIndex, 1);
            if (removed) {
                elements.splice(toIndex, 0, removed);
            }
            return { elements, _isRemoteUpdate: false }; // Local change
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
            _isRemoteUpdate: false, // Local change
        })),

        // setElements can be local or remote
        setElements: (elements, isRemote = true) => set({
            elements,
            selectedElementId: null,
            _isRemoteUpdate: isRemote,
        }),

        selectElement: (id) => set({ selectedElementId: id }),
        setActiveId: (id) => set({ activeId: id }),

        getSelectedElement: () => {
            const state = get();
            return state.elements.find(e => e.id === state.selectedElementId) || null;
        },

        setRows: (rows) => set({ rows }),
        setGridColumns: (columns) => set({ gridColumns: columns }),
    }))
);

// Auto-save subscription
let saveTimeoutId: NodeJS.Timeout | null = null;
let saveCallback: (() => void) | null = null;

export const registerAutoSave = (onSave: () => void) => {
    saveCallback = onSave;
};

export const unregisterAutoSave = () => {
    saveCallback = null;
    if (saveTimeoutId) {
        clearTimeout(saveTimeoutId);
        saveTimeoutId = null;
    }
};

useBuilderStore.subscribe(
    (state) => ({ elements: state.elements, isRemote: state._isRemoteUpdate }),
    (curr, prev) => {
        if (curr.isRemote) {
            return;
        }

        if (JSON.stringify(curr.elements) === JSON.stringify(prev.elements)) {
            return;
        }

        if (saveTimeoutId) {
            clearTimeout(saveTimeoutId);
        }

        saveTimeoutId = setTimeout(() => {
            if (saveCallback) {
                console.log('⏰ Auto-save triggered');
                saveCallback();
            }
        }, 2000);
    },
    { equalityFn: (a, b) => a === b }
);
