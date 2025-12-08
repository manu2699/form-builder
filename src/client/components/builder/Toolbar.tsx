import { useState } from 'react';

import { useDraggable } from '@dnd-kit/core';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { FIELD_CONFIGS, FIELD_TYPES, type FieldType } from '@/client/components/fields';

const DraggableField = ({ type, collapsed }: { type: FieldType; collapsed: boolean }) => {
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
                ${collapsed ? 'justify-center p-2' : 'gap-3 p-3'}
            `}
            title={collapsed ? config.label : undefined}
        >
            <Icon size={18} className="text-gray-600 shrink-0" />
            {!collapsed && <span className="text-sm font-medium text-gray-700">{config.label}</span>}
        </div>
    );
};

export const Toolbar = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div
            className={`
                bg-white border-r border-gray-200 h-full flex flex-col shrink-0 transition-all duration-200
                ${collapsed ? 'w-14' : 'w-64'}
            `}
        >
            {/* Header with toggle */}
            <div className={`p-3 border-b border-gray-100 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
                {!collapsed && (
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Components
                    </h2>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1 hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                    title={collapsed ? 'Expand panel' : 'Collapse panel'}
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            {/* Field list */}
            <div className={`flex-1 overflow-y-auto ${collapsed ? 'p-2' : 'p-4'}`}>
                <div className={collapsed ? 'space-y-2' : 'space-y-2'}>
                    {FIELD_TYPES.map((type) => (
                        <DraggableField key={type} type={type} collapsed={collapsed} />
                    ))}
                </div>
            </div>
        </div>
    );
};
