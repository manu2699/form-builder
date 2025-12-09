// FormNodeGrid - Grid for form elements inside a FormNode (uses FormStore context)
import { useState, useRef, useCallback, useEffect, createContext, useContext } from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { Trash2, GripVertical } from 'lucide-react';

import { renderFieldPreview } from '@/client/components/fields';
import { useFormStore, type FormElement } from '@/client/store/formStore';
import { getCollaboratorOnElement, onCollaboratorsChange, setSelectedElement, type Collaborator } from '@/client/lib/collaboration';
import { getUserInitials } from '@/client/lib/user';

// Context to pass nodeId down to DropZone
const NodeContext = createContext<string>('');

interface GridElementProps {
    element: FormElement;
    index: number;
}

const GridElement = ({ element, index }: GridElementProps) => {
    const nodeId = useContext(NodeContext);
    const removeElement = useFormStore(s => s.removeElement);
    const resizeElement = useFormStore(s => s.resizeElement);
    const selectElement = useFormStore(s => s.selectElement);
    const selectedElementId = useFormStore(s => s.selectedElementId);

    const [isResizing, setIsResizing] = useState(false);
    const [collaboratorOnElement, setCollaboratorOnElement] = useState<Collaborator | null>(null);
    const elementRef = useRef<HTMLDivElement>(null);
    const startXRef = useRef(0);
    const startSpanRef = useRef(element.colSpan);

    const isSelected = selectedElementId === element.id;

    // Check if another user is editing this element
    useEffect(() => {
        const checkCollaborator = () => {
            const collab = getCollaboratorOnElement(element.id);
            setCollaboratorOnElement(collab);
        };
        checkCollaborator();
        const unsubscribe = onCollaboratorsChange(checkCollaborator);
        return unsubscribe;
    }, [element.id]);

    // Make element draggable for reordering
    const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
        id: `grid-element-${element.id}`,
        data: {
            type: 'grid-element',
            element,
            index,
            nodeId,
        }
    });

    // Make element a drop target for reordering
    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: `drop-${element.id}`,
        data: {
            type: 'grid-element',
            element,
            index,
            nodeId,
        }
    });

    // Apply cursor style during resize
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
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[data-drag-handle]')) {
            return;
        }
        selectElement(element.id);
        setSelectedElement(element.id); // Broadcast to collaborators
    };

    return (
        <div
            ref={(node) => {
                elementRef.current = node;
                setDropRef(node);
            }}
            onClick={handleClick}
            className={`
                relative group bg-white border shadow-sm cursor-pointer transition-all
                ${isSelected ? 'border-gray-400' : 'border-gray-200 hover:border-gray-300'}
                ${isResizing ? 'ring-1 ring-gray-400 select-none' : ''}
                ${isDragging ? 'opacity-50 ring-1 ring-blue-500' : ''}
                ${isOver ? 'border-gray-400 border-dashed' : ''}
                ${collaboratorOnElement ? 'ring-2' : ''}
            `}
            style={{
                gridColumn: `span ${element.colSpan}`,
                ...(collaboratorOnElement ? { '--tw-ring-color': collaboratorOnElement.color } as React.CSSProperties : {})
            }}
        >
            {/* Collaborator indicator */}
            {collaboratorOnElement && (
                <div
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium text-white border-2 border-white shadow-sm z-20"
                    style={{ backgroundColor: collaboratorOnElement.color }}
                    title={`${collaboratorOnElement.name} is editing`}
                >
                    {getUserInitials(collaboratorOnElement.name)}
                </div>
            )}
            {/* Delete button */}
            <button
                onClick={() => removeElement(element.id)}
                className="absolute -right-2 -top-2 bg-white text-gray-400 border border-gray-200 hover:text-red-600 hover:border-red-200 p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                title="Delete element"
            >
                <Trash2 size={14} />
            </button>

            {/* Drag handle */}
            <div
                ref={setDragRef}
                {...listeners}
                {...attributes}
                className="absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-8 bg-white border border-gray-200 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-gray-100 hover:border-gray-300 transition-all opacity-0 group-hover:opacity-100 shadow-sm z-10"
                title="Drag to reorder"
            >
                <GripVertical size={12} className="text-gray-400" />
            </div>

            {/* Resize handle */}
            <div
                onMouseDown={handleResizeStart}
                className={`
                    absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize
                    opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10
                    ${isResizing ? 'opacity-100 bg-black/20' : ''}
                `}
                title="Drag to resize"
            >
                <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-gray-300 group-hover:bg-gray-500" />
            </div>

            {/* Element content */}
            <div className="p-4">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
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
    const nodeId = useContext(NodeContext);

    const { setNodeRef, isOver } = useDroppable({
        id: `${nodeId}-${id}`,
        data: { type: 'drop-zone', nodeId }
    });

    return (
        <div
            ref={setNodeRef}
            className={`
                min-h-[80px] border-2 border-dashed flex items-center justify-center text-sm transition-all
                ${isEmpty ? 'col-span-3 border-gray-300' : 'col-span-1 border-gray-200'}
                ${isOver ? 'border-blue-400 bg-blue-50 text-blue-600' : 'text-gray-400'}
            `}
        >
            {isEmpty ? 'Drop fields here' : '+'}
        </div>
    );
};

interface FormNodeGridProps {
    nodeId: string;
}

export const FormNodeGrid = ({ nodeId }: FormNodeGridProps) => {
    const elements = useFormStore(s => s.elements);

    return (
        <NodeContext.Provider value={nodeId}>
            <div className="w-full">
                <div
                    className="w-full bg-white p-3"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.75rem',
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
        </NodeContext.Provider>
    );
};
