import React, { useState, useRef, useCallback, useEffect } from 'react';

import { useDroppable, useDraggable } from '@dnd-kit/core';
import { Trash2, GripVertical } from 'lucide-react';

import { renderFieldPreview } from '@/client/components/fields';
import { getCollaboratorOnElement, onCollaboratorsChange, setSelectedElement as setCollabSelectedElement, type Collaborator } from '@/client/lib/collaboration';
import { getUserInitials } from '@/client/lib/user';
import { useBuilderStore, type FormElement } from '@/client/store/builderStore';

interface GridElementProps {
    element: FormElement;
    index: number;
}

const GridElement = ({ element, index }: GridElementProps) => {
    const { removeElement, resizeElement, selectElement, selectedElementId } = useBuilderStore();
    const [isResizing, setIsResizing] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);
    const startXRef = useRef(0);
    const startSpanRef = useRef(element.colSpan);

    const isSelected = selectedElementId === element.id;
    const [collaboratorOnElement, setCollaboratorOnElement] = useState<Collaborator | null>(null);

    // Track collaborator editing this element
    useEffect(() => {
        const updateCollaborator = () => {
            setCollaboratorOnElement(getCollaboratorOnElement(element.id));
        };
        updateCollaborator();
        const unsubscribe = onCollaboratorsChange(updateCollaborator);
        return unsubscribe;
    }, [element.id]);

    // Notify collaboration when we select this element
    useEffect(() => {
        if (isSelected) {
            setCollabSelectedElement(element.id);
        }
    }, [isSelected, element.id]);

    // Make element draggable for reordering
    const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
        id: `grid-element-${element.id}`,
        data: {
            type: 'grid-element',
            element,
            index,
        }
    });

    // Make element a drop target for reordering
    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: `drop-${element.id}`,
        data: {
            type: 'grid-element',
            element,
            index,
        }
    });

    // Apply cursor style to body during resize
    useEffect(() => {
        if (isResizing) {
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing]);

    const handleResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        startXRef.current = e.clientX;
        startSpanRef.current = element.colSpan;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!elementRef.current) return;
            const deltaX = moveEvent.clientX - startXRef.current;
            const elementWidth = elementRef.current.offsetWidth / element.colSpan;
            const spanDelta = Math.round(deltaX / elementWidth);
            const newSpan = Math.min(3, Math.max(1, startSpanRef.current + spanDelta)) as 1 | 2 | 3;

            if (newSpan !== element.colSpan) {
                resizeElement(element.id, newSpan);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [element.colSpan, element.id, resizeElement]);

    const handleClick = (e: React.MouseEvent) => {
        // Don't select if clicking on delete button or drag handle
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[data-drag-handle]')) {
            return;
        }
        selectElement(element.id);
    };

    return (
        <div
            ref={(node) => {
                elementRef.current = node;
                setDropRef(node);
            }}
            onClick={handleClick}
            className={`
        relative group bg-white border-2 shadow-sm cursor-pointer
        transition-all
        ${isSelected ? 'border-black ring-2 ring-black/10' : 'border-gray-200 hover:border-gray-400'}
        ${isResizing ? 'ring-1 ring-black select-none' : ''}
        ${isDragging ? 'opacity-50 ring-1 ring-blue-500' : ''}
        ${isOver ? 'border-black border-dashed' : ''}
      `}
            style={{ gridColumn: `span ${element.colSpan}` }}
        >
            {/* Delete button */}
            <button
                onClick={() => removeElement(element.id)}
                className="absolute -right-2 -top-2 bg-white text-gray-400 border border-gray-200 hover:text-red-600 hover:border-red-200 p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                title="Delete element"
            >
                <Trash2 size={14} />
            </button>

            {/* Collaborator indicator - shows who is editing this element */}
            {collaboratorOnElement && (
                <div
                    className="absolute -left-3 -top-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-white shadow-md z-20"
                    style={{ backgroundColor: collaboratorOnElement.color }}
                    title={`${collaboratorOnElement.name} is editing`}
                >
                    {getUserInitials(collaboratorOnElement.name)}
                </div>
            )}

            {/* Drag handle - absolute, show on hover */}
            <div
                ref={setDragRef}
                {...listeners}
                {...attributes}
                className="absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-8 bg-white border border-gray-200 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-gray-100 hover:border-gray-300 transition-all opacity-0 group-hover:opacity-100 shadow-sm z-10"
                title="Drag to reorder"
            >
                <GripVertical size={12} className="text-gray-400" />
            </div>

            {/* Resize handle - right edge */}
            <div
                onMouseDown={handleResizeStart}
                className={`
          absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize
          opacity-0 group-hover:opacity-100 transition-opacity
          hover:bg-black/10
          ${isResizing ? 'opacity-100 bg-black/20' : ''}
        `}
                title="Drag to resize"
            >
                <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-gray-300 group-hover:bg-gray-500" />
            </div>

            {/* Element content - no offset needed now */}
            <div className="p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {element.label}
                </label>
                {renderFieldPreview(element.type, { placeholder: element.placeholder })}
            </div>

            {/* Width indicator */}
            <div className="absolute bottom-1 right-2 text-xs text-gray-200 opacity-0 group-hover:opacity-100">
                {element.colSpan}/3
            </div>
        </div>
    );
};

const DropZone = ({ id, isEmpty }: { id: string; isEmpty?: boolean }) => {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: { type: 'grid-cell' }
    });

    return (
        <div
            ref={setNodeRef}
            className={`
        min-h-[120px] border-2 border-dashed flex items-center justify-center text-sm transition-all
        ${isEmpty ? 'col-span-3 border-gray-300' : 'col-span-1 border-gray-200'}
        ${isOver ? 'border-black bg-gray-50 text-gray-600' : 'text-gray-400'}
      `}
        >
            {isEmpty ? 'Drop elements here' : '+'}
        </div>
    );
};

export const BuilderGrid = () => {
    const { elements } = useBuilderStore();

    return (
        <div className="w-full">
            <div
                className="w-full bg-white border border-gray-200 p-4"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                }}
            >
                {elements.length === 0 ? (
                    <DropZone id="empty-zone" isEmpty />
                ) : (
                    <>
                        {elements.map((element, index) => (
                            <GridElement key={element.id} element={element} index={index} />
                        ))}
                        <DropZone id="add-zone" />
                    </>
                )}
            </div>
        </div>
    );
};
