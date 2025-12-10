// Collaborator Avatars - Shows connected users with popovers
import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

import {
    getCollaborators,
    onCollaboratorsChange,
    type Collaborator
} from '@/client/lib/collaboration';
import { getUser, getUserInitials } from '@/client/lib/user';

// Individual avatar with hover popover
const Avatar = ({
    name,
    color,
    initials,
    isCurrentUser = false,
    selectedFormName
}: {
    name: string;
    color: string;
    initials: string;
    isCurrentUser?: boolean;
    selectedFormName?: string | null;
}) => {
    const [showPopover, setShowPopover] = useState(false);

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowPopover(true)}
            onMouseLeave={() => setShowPopover(false)}
        >
            <div
                className={`
                    w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white
                    border-2 border-white shadow-sm cursor-pointer transition-transform hover:scale-110
                    ${isCurrentUser ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
                `}
                style={{ backgroundColor: color }}
                title={name}
            >
                {initials}
            </div>

            {/* Popover */}
            {showPopover && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: color }}
                            />
                            <span className="font-medium">{name}</span>
                            {isCurrentUser && <span className="text-gray-400">(you)</span>}
                        </div>
                        {selectedFormName && (
                            <div className="text-gray-400 mt-1 text-[10px]">
                                Editing: {selectedFormName}
                            </div>
                        )}
                        {/* Arrow */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                    </div>
                </div>
            )}
        </div>
    );
};

export const CollaboratorAvatars = () => {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const currentUser = getUser();

    useEffect(() => {
        // Initial load
        setCollaborators(getCollaborators());
        setIsConnected(true);

        // Listen for awareness changes
        const unsubscribe = onCollaboratorsChange((collabs) => {
            setCollaborators(collabs);
            setIsConnected(true);
        });

        return unsubscribe;
    }, []);

    const totalUsers = collaborators.length + 1;

    return (
        <div className="flex items-center gap-2">
            {/* Connection indicator */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
                <Users size={14} />
                <span>{totalUsers}</span>
            </div>

            {/* Avatar stack */}
            <div className="flex items-center -space-x-2">
                {/* Current user */}
                <Avatar
                    name={currentUser.name}
                    color={currentUser.color}
                    initials={getUserInitials(currentUser.name)}
                    isCurrentUser
                />

                {/* Other collaborators */}
                {collaborators.slice(0, 4).map((collab) => (
                    <Avatar
                        key={collab.id}
                        name={collab.name}
                        color={collab.color}
                        initials={getUserInitials(collab.name)}
                        selectedFormName={collab.selectedFormName}
                    />
                ))}

                {/* Overflow indicator */}
                {collaborators.length > 4 && (
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white">
                        +{collaborators.length - 4}
                    </div>
                )}
            </div>
        </div>
    );
};
