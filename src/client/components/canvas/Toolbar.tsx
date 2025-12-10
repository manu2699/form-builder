import { useState } from 'react';

import { useDraggable } from '@dnd-kit/core';

import { FIELD_CONFIGS, FIELD_TYPES, type FieldType } from '@/client/components/fields';

const DraggableField = ({ type, expanded }: { type: FieldType; expanded: boolean }) => {
    const config = FIELD_CONFIGS[type];
    const Icon = config.icon;

    const { attributes, listeners, setNodeRef } = useDraggable({
        id: `new-${type}`,
        data: {
            type: 'sidebar-item',
            payload: { type, label: config.label }
        }
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`
                flex items-center bg-white border border-gray-200 cursor-grab 
                hover:border-black hover:shadow-sm transition-all 
                focus:outline-none focus:ring-2 focus:ring-black no-select
                ${expanded ? 'gap-2 p-2' : 'justify-center p-1'}
            `}
            title={!expanded ? config.label : undefined}
        >
            <Icon size={14} className="text-gray-600 shrink-0" />
            {expanded && <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{config.label}</span>}
        </div>
    );
};

export const Toolbar = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`
                bg-white border-r border-gray-200 h-full flex flex-col shrink-0 transition-all duration-200
                ${isHovered ? 'w-44' : 'w-11'}
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Header */}
            <div className={`p-2 border-b border-gray-100 flex items-center ${isHovered ? 'justify-start' : 'justify-center'}`}>
                {isHovered ? (
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider">
                        Components
                    </p>
                ) : (
                    <div className="w-3 h-3 rounded-full bg-gray-300" title="Hover to expand" />
                )}
            </div>

            {/* Field list */}
            <div className={`flex-1 overflow-y-auto ${isHovered ? 'p-2' : 'p-1.5'}`}>
                <div className="space-y-1.5">
                    {FIELD_TYPES.map((type) => (
                        <DraggableField key={type} type={type} expanded={isHovered} />
                    ))}
                </div>
            </div>
        </div>
    );
};
