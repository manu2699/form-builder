import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { FormColumn } from '../../store/builderStore';
import { SortableItem } from './SortableItem';

interface DroppableColumnProps {
    column: FormColumn;
    rowId: string;
}

export const DroppableColumn = ({ column, rowId }: DroppableColumnProps) => {
    const { setNodeRef } = useDroppable({
        id: column.id,
        data: { type: 'column', rowId, colId: column.id },
    });

    return (
        <div ref={setNodeRef} className="flex-1 min-h-[100px] bg-gray-50/50 border border-dashed border-gray-300 rounded p-2 flex flex-col gap-2">
            <SortableContext items={column.elements.map(e => e.id)} strategy={verticalListSortingStrategy}>
                {column.elements.map(element => (
                    <SortableItem key={element.id} element={element} rowId={rowId} colId={column.id} />
                ))}
                {column.elements.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-xs text-center py-4">
                        Drop items here
                    </div>
                )}
            </SortableContext>
        </div>
    );
};
