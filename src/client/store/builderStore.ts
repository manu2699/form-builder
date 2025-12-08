import { create } from 'zustand';
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

    // Element actions
    addElement: (type: FieldType) => void;
    removeElement: (id: string) => void;
    resizeElement: (id: string, colSpan: 1 | 2 | 3) => void;
    reorderElements: (fromIndex: number, toIndex: number) => void;
    updateElementProperty: (id: string, key: string, value: any) => void;
    setElements: (elements: FormElement[]) => void;

    // Selection
    selectElement: (id: string | null) => void;
    setActiveId: (id: string | null) => void;

    // Get selected element
    getSelectedElement: () => FormElement | null;

    // Legacy compatibility
    rows: any[];
    setRows: (rows: any[]) => void;
    gridColumns: 2 | 4 | 6 | 12;
    setGridColumns: (columns: 2 | 4 | 6 | 12) => void;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
    elements: [],
    selectedElementId: null,
    activeId: null,
    rows: [],
    gridColumns: 4,

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
            selectedElementId: newElement.id, // Auto-select new element
        };
    }),

    removeElement: (id) => set((state) => ({
        elements: state.elements.filter(e => e.id !== id),
        selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
    })),

    resizeElement: (id, colSpan) => set((state) => ({
        elements: state.elements.map(e =>
            e.id === id ? { ...e, colSpan } : e
        )
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
                    // Handle special keys that are top-level
                    ...(key === 'label' || key === 'placeholder' || key === 'required' || key === 'visibilityRules'
                        ? { [key]: value }
                        : { properties: { ...e.properties, [key]: value } }
                    )
                }
                : e
        )
    })),

    selectElement: (id) => set({ selectedElementId: id }),
    setActiveId: (id) => set({ activeId: id }),

    getSelectedElement: () => {
        const state = get();
        return state.elements.find(e => e.id === state.selectedElementId) || null;
    },

    setElements: (elements) => set({ elements, selectedElementId: null }),
    setRows: (rows) => set({ rows }),
    setGridColumns: (columns) => set({ gridColumns: columns }),
}));
