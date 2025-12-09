// HyperForms Canvas Page - Main canvas-based form builder
import { useEffect, useState } from 'react';
import { DndContext, useSensor, useSensors, MouseSensor, type DragEndEvent, type DragStartEvent, DragOverlay, closestCenter } from '@dnd-kit/core';
import { Save, Plus } from 'lucide-react';
import { nanoid } from 'nanoid';

import { Canvas } from '@/client/components/canvas';
import { Toolbar } from '@/client/components/canvas/Toolbar';
import { CanvasPropertyPanel } from '@/client/components/properties/CanvasPropertyPanel';
import { Button } from '@/client/components/ui/Button';
import { CreateFormModal } from '@/client/components/ui/Modal';
import { FormNodeWithStore } from '@/client/components/form';
import { CollaboratorAvatars } from '@/client/components/collaboration/CollaboratorAvatars';
import { initCollaboration, destroyCollaboration, setSelectedNode } from '@/client/lib/collaboration';
import type { FormElement, FormNodeStoreApi } from '@/client/store/formStore';

// Type for canvas nodes
interface CanvasNode {
    id: string;
    formId: string;
    title: string;
    position: { x: number; y: number };
    elements: FormElement[];
}

// Type for form API response
interface FormApiResponse {
    id: string;
    name: string;
    layout: string | FormElement[];
    schema: unknown;
}

// Map to store refs to each node's store API
const nodeStoreRefs = new Map<string, FormNodeStoreApi>();

// Currently active node ID (for PropertyPanel to know which store to use)
let activeNodeId: string | null = null;

export const setActiveNodeId = (nodeId: string | null) => {
    activeNodeId = nodeId;
};

export const getActiveNodeStore = (): FormNodeStoreApi | null => {
    if (!activeNodeId) return null;
    return nodeStoreRefs.get(activeNodeId) || null;
};

export const registerNodeStore = (nodeId: string, store: FormNodeStoreApi) => {
    nodeStoreRefs.set(nodeId, store);
};

export const unregisterNodeStore = (nodeId: string) => {
    nodeStoreRefs.delete(nodeId);
};

export const HyperFormsPage = () => {
    const [nodes, setNodes] = useState<CanvasNode[]>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeDragItem, setActiveDragItem] = useState<{ type: string; label: string } | null>(null);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: { distance: 8 },
        }),
    );

    // Initialize collaboration and load forms on mount
    useEffect(() => {
        initCollaboration('canvas');
        fetchAllForms();
        return () => destroyCollaboration();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAllForms = async () => {
        try {
            const res = await fetch('/api/forms');
            const forms: FormApiResponse[] = await res.json();

            const newNodes: CanvasNode[] = forms.map((form, index) => {
                const layoutData = form.layout
                    ? (typeof form.layout === 'string' ? JSON.parse(form.layout) : form.layout)
                    : [];
                return {
                    id: `node-${form.id}`,
                    formId: form.id,
                    title: form.name || 'Untitled Form',
                    position: { x: 100 + (index % 3) * 550, y: 100 + Math.floor(index / 3) * 400 },
                    elements: Array.isArray(layoutData) ? layoutData : [],
                };
            });
            setNodes(newNodes);
        } catch (err) {
            console.error("Failed to load forms", err);
        }
    };

    const handleCreateForm = async (name: string) => {
        try {
            const id = nanoid();
            const res = await fetch('/api/forms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name, layout: [], schema: [] })
            });
            const newForm = await res.json();

            const newNode: CanvasNode = {
                id: `node-${newForm.id}`,
                formId: newForm.id,
                title: newForm.name,
                position: {
                    x: 100 + (nodes.length % 3) * 550,
                    y: 100 + Math.floor(nodes.length / 3) * 400
                },
                elements: [],
            };
            setNodes(prev => [...prev, newNode]);
            setSelectedNodeId(newNode.id);
            setIsCreateModalOpen(false);
        } catch (err) {
            console.error("Failed to create form", err);
        }
    };

    const updateNodePosition = (nodeId: string, position: { x: number; y: number }) => {
        setNodes(prev => prev.map(n =>
            n.id === nodeId ? { ...n, position } : n
        ));
    };

    const saveAllForms = async () => {
        setSaving(true);
        try {
            console.log('💾 Save triggered');
        } finally {
            setSaving(false);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        if (active.data.current?.type === 'sidebar-item') {
            setActiveDragItem({
                type: active.data.current.payload.type,
                label: active.data.current.payload.label,
            });
        }
    };

    // Handle drag end - add element to the target form node
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragItem(null);

        console.log('🎯 DragEnd:', { over: over?.id, overData: over?.data.current });
        console.log('📋 Registered nodes:', Array.from(nodeStoreRefs.keys()));

        if (!over) {
            console.log('❌ No drop target');
            return;
        }

        const activeData = active.data.current;
        const overData = over.data.current;

        console.log('📦 activeData.type =', activeData?.type, ', overData.type =', overData?.type);
        console.log('📦 Full overData:', JSON.stringify(overData));

        const isValidDropTarget = overData?.type === 'form-node' || overData?.type === 'drop-zone';

        // Handle sidebar item drops onto form nodes
        if (activeData?.type === 'sidebar-item' && isValidDropTarget && overData?.nodeId) {
            const nodeId = overData.nodeId;
            const fieldType = activeData.payload.type;

            console.log('🔍 Looking for nodeId:', nodeId);

            const nodeStore = nodeStoreRefs.get(nodeId);
            if (nodeStore) {
                nodeStore.getState().addElement(fieldType);
                console.log(`✅ Added ${fieldType} to node ${nodeId}`);
            } else {
                console.log('❌ Node store not found for:', nodeId);
            }
            return;
        }

        // Handle grid element reordering within the same form node
        if (activeData?.type === 'grid-element' && overData?.type === 'grid-element') {
            const fromNodeId = activeData.nodeId;
            const toNodeId = overData.nodeId;

            // Only reorder within the same node
            if (fromNodeId === toNodeId) {
                const fromIndex = activeData.index;
                const toIndex = overData.index;

                if (fromIndex !== toIndex) {
                    const nodeStore = nodeStoreRefs.get(fromNodeId);
                    if (nodeStore) {
                        nodeStore.getState().reorderElements(fromIndex, toIndex);
                        console.log(`🔀 Reordered element from ${fromIndex} to ${toIndex} in node ${fromNodeId}`);
                    }
                }
            }
            return;
        }

        console.log('⚠️ Drop did not match any conditions');
    };

    // Sync activeNodeId with selectedNodeId for PropertyPanel access
    useEffect(() => {
        setActiveNodeId(selectedNodeId);
        // Also update collaboration awareness with selected form name
        const node = nodes.find(n => n.id === selectedNodeId);
        setSelectedNode(selectedNodeId, node?.title ?? null);
    }, [selectedNodeId, nodes]);

    // Deselect when clicking on canvas background
    const handleCanvasClick = () => {
        setSelectedNodeId(null);
        setActiveNodeId(null);
        setSelectedNode(null, null);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="h-full w-full flex flex-col bg-gray-100">
                {/* Header */}
                <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 shrink-0 bg-white z-20">
                    <div className="flex items-center gap-4">
                        <h1 className="font-bold text-xl tracking-tight text-gray-900">
                            HyperForms
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Collaborator Avatars */}
                        <CollaboratorAvatars />
                        <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                            <Plus size={16} />
                            New Form
                        </Button>
                        <Button onClick={saveAllForms} disabled={saving} size="sm" className="gap-2">
                            <Save size={16} />
                            {saving ? 'Saving...' : 'Save All'}
                        </Button>
                    </div>
                </div>

                {/* Main canvas area with conditional overlays */}
                <div className="flex-1 relative overflow-hidden" onClick={handleCanvasClick}>
                    {/* Floating Toolbar (left overlay) */}
                    <div
                        className="absolute left-2 top-2 bottom-4 z-10 pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="h-max bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                            <Toolbar />
                        </div>
                    </div>

                    {/* Floating Property Panel (right overlay) - only when node selected */}
                    {selectedNodeId && (
                        <div
                            className="absolute right-2 top-2 bottom-4 z-10 pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="h-[90%] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                                <CanvasPropertyPanel />
                            </div>
                        </div>
                    )}

                    {/* Canvas */}
                    <Canvas>
                        {nodes.map(node => (
                            <FormNodeWithStore
                                key={node.id}
                                id={node.id}
                                formId={node.formId}
                                title={node.title}
                                position={node.position}
                                initialElements={node.elements}
                                isSelected={selectedNodeId === node.id}
                                onSelect={() => setSelectedNodeId(node.id)}
                                onPositionChange={(pos) => updateNodePosition(node.id, pos)}
                            />
                        ))}
                    </Canvas>
                </div>

                {/* Create Form Modal */}
                <CreateFormModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateForm}
                />

                {/* Drag Overlay */}
                <DragOverlay dropAnimation={null}>
                    {activeDragItem ? (
                        <div className="bg-white border border-black shadow-2xl w-[200px] pointer-events-none p-3">
                            <div className="text-sm font-medium text-gray-700">{activeDragItem.label}</div>
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
};
