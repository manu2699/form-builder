import { create } from 'zustand';
import type { FormNodeStoreApi } from './formStore';

interface CanvasState {
    activeNodeId: string | null;
    setActiveNodeId: (nodeId: string | null) => void;

    // Node store instances map
    nodeStores: Map<string, FormNodeStoreApi>;
    registerNodeStore: (nodeId: string, store: FormNodeStoreApi) => void;
    unregisterNodeStore: (nodeId: string) => void;
    getNodeStore: (nodeId: string) => FormNodeStoreApi | undefined;

    getActiveNodeStore: () => FormNodeStoreApi | null;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
    activeNodeId: null,
    nodeStores: new Map(),

    setActiveNodeId: (nodeId) => set({ activeNodeId: nodeId }),

    registerNodeStore: (nodeId, store) => set((state) => {
        const newMap = new Map(state.nodeStores);
        newMap.set(nodeId, store);
        return { nodeStores: newMap };
    }),

    unregisterNodeStore: (nodeId) => set((state) => {
        const newMap = new Map(state.nodeStores);
        newMap.delete(nodeId);
        return { nodeStores: newMap };
    }),

    getNodeStore: (nodeId) => get().nodeStores.get(nodeId),

    getActiveNodeStore: () => {
        const { activeNodeId, nodeStores } = get();
        if (!activeNodeId) return null;
        return nodeStores.get(activeNodeId) || null;
    },
}));
