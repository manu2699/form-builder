// FormNodeWithStore - FormNode wrapper that registers its store actions to parent
import { useEffect } from 'react';
import { FormNode } from './FormNode';
import { FormStoreProvider, useFormStore, type FormElement } from '@/client/store/formStore';
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
    const addElement = useFormStore(s => s.addElement);
    const updateElementProperty = useFormStore(s => s.updateElementProperty);
    const reorderElements = useFormStore(s => s.reorderElements);
    const selectElement = useFormStore(s => s.selectElement);
    const elements = useFormStore(s => s.elements);
    const selectedElementId = useFormStore(s => s.selectedElementId);

    useEffect(() => {
        registerNodeStore(nodeId, {
            addElement,
            updateElementProperty,
            reorderElements,
            selectElement,
            getElements: () => elements,
            getSelectedElementId: () => selectedElementId,
            getSelectedElement: () => elements.find(e => e.id === selectedElementId) || null,
        });
        return () => unregisterNodeStore(nodeId);
    }, [nodeId, addElement, updateElementProperty, reorderElements, selectElement, elements, selectedElementId]);

    return null;
};

export const FormNodeWithStore = ({ id, formId, initialElements = [], ...props }: FormNodeWithStoreProps) => {
    return (
        <FormStoreProvider formId={formId} initialElements={initialElements}>
            <StoreRegistrar nodeId={id} />
            <FormNodeInner id={id} formId={formId} {...props} />
        </FormStoreProvider>
    );
};

// Copy of FormNodeInner from FormNode.tsx to avoid circular deps
import { useState, useRef, useCallback, type MouseEvent } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Eye, GripVertical, Save, Loader2 } from 'lucide-react';
import { FormNodeGrid } from './FormNodeGrid';

const FormNodeInner = ({
    id,
    formId,
    title,
    position,
    isSelected,
    onSelect,
    onPositionChange,
}: Omit<FormNodeWithStoreProps, 'initialElements'>) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0, nodeX: 0, nodeY: 0 });
    const nodeRef = useRef<HTMLDivElement>(null);
    const elements = useFormStore((state) => state.elements);

    // Make the entire node a drop target for toolbar items
    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: `form-node-drop-${id}`,
        data: { type: 'form-node', formId, nodeId: id }
    });

    // Handle node drag start (from drag handle only)
    const handleNodeDragStart = useCallback((e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        dragStartPos.current = {
            x: e.clientX,
            y: e.clientY,
            nodeX: position.x,
            nodeY: position.y,
        };

        const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
            const dx = moveEvent.clientX - dragStartPos.current.x;
            const dy = moveEvent.clientY - dragStartPos.current.y;
            onPositionChange?.({
                x: dragStartPos.current.nodeX + dx,
                y: dragStartPos.current.nodeY + dy,
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [position, onPositionChange]);

    // Save form to API
    const handleSave = useCallback(async (e: MouseEvent) => {
        e.stopPropagation();
        setIsSaving(true);
        try {
            await fetch(`/api/forms/${formId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ elements }),
            });
        } catch (error) {
            console.error('Failed to save form:', error);
        } finally {
            setIsSaving(false);
        }
    }, [formId, elements]);

    return (
        <div
            ref={(node) => {
                nodeRef.current = node;
                setDropRef(node);
            }}
            className={`
                absolute bg-white rounded-lg shadow-lg border-2 min-w-[900px]
                ${isSelected ? 'border-blue-500 shadow-xl' : 'border-gray-200'}
                ${isDragging ? 'shadow-2xl' : ''}
                ${isOver ? 'ring-2 ring-blue-400 border-blue-400' : ''}
            `}
            style={{
                left: position.x,
                top: position.y,
                zIndex: isSelected ? 10 : 1,
            }}
            onClick={(e) => {
                e.stopPropagation();
                onSelect?.();
            }}
        >
            {/* Node Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <div
                        onMouseDown={handleNodeDragStart}
                        className={`p-1 -ml-1 rounded cursor-grab hover:bg-gray-200 ${isDragging ? 'cursor-grabbing' : ''}`}
                        title="Drag to move"
                    >
                        <GripVertical size={16} className="text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/preview/${formId}`, '_blank');
                        }}
                        title="Preview form"
                    >
                        <Eye size={14} />
                    </button>
                    <button
                        className={`p-1.5 rounded ${isSaving ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
                        onClick={handleSave}
                        disabled={isSaving}
                        title="Save form"
                    >
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    </button>
                </div>
            </div>

            {/* Form Content */}
            <div className="p-2">
                <FormNodeGrid nodeId={id} />
            </div>
        </div>
    );
};
