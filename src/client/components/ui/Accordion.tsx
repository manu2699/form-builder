// Accordion Component
import React, { useState, type ReactNode } from 'react';

import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
}

interface AccordionProps {
    children: ReactNode;
}


export const AccordionItem = ({ title, children, defaultOpen = false }: AccordionItemProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-100 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {title}
                </span>
                <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            {isOpen && (
                <div className="p-3 pb-4 px-4">
                    {children}
                </div>
            )}
        </div>
    );
};

export const Accordion = ({ children }: AccordionProps) => {
    return <div className="divide-y divide-gray-100">{children}</div>;
};
