import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';

import { type FormElement, useBuilderStore } from '@/client/store/builderStore';

interface SortableItemProps {
    element: FormElement;
    rowId: string;
    colId: string;
}

export const SortableItem = ({ element, rowId, colId }: SortableItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: element.id, data: { type: 'element', element, rowId, colId } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    // Stub for removing (would need store action)
    //   const removeElement = () => {};

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white p-3 rounded border border-gray-200 shadow-sm flex items-center gap-3 group relative cursor-move"
            {...attributes}
            {...listeners}
        >
            <GripVertical className="text-gray-400" size={16} />
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">{element.label}</label>
                {element.type === 'input' && (
                    <input type="text" disabled className="mt-1 block w-full border-gray-300 shadow-sm sm:text-sm bg-gray-50 border p-1" placeholder="Input field" />
                )}
                {element.type === 'textarea' && (
                    <textarea disabled className="mt-1 block w-full border-gray-300 shadow-sm sm:text-sm bg-gray-50 border p-1 h-16" placeholder="Text Area" />
                )}
                {element.type === 'button' && (
                    <button disabled className="mt-1 px-3 py-1 bg-blue-600 text-white text-sm">Button</button>
                )}
            </div>
        </div>
    );
};
