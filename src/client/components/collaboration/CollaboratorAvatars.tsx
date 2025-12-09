// Collaborator Avatars - Shows connected users with popovers
import { useEffect, useState, useCallback } from 'react';
import { Users } from 'lucide-react';

import {
    getCollaborators,
    onCollaboratorsChange,
    getCollaboration,
    onCollaborationReady,
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
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-white shadow-sm cursor-pointer"
                style={{ backgroundColor: color }}
            >
                {initials}
            </div>

            {/* Popover */}
            {showPopover && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: color }}
                            />
                            <span className="font-medium">{name}</span>
                            {isCurrentUser && <span className="text-gray-400">(You)</span>}
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
    const [isReady, setIsReady] = useState(false);
    const currentUser = getUser();

    const setupListeners = useCallback(() => {
        const collab = getCollaboration();
        if (!collab) return () => { };

        // Initial load
        setCollaborators(getCollaborators());
        setIsConnected(collab.provider.wsconnected);
        setIsReady(true);

        // Listen for awareness changes
        const unsubscribe = onCollaboratorsChange(setCollaborators);

        // Connection status
        const handleStatus = ({ status }: { status: string }) => {
            setIsConnected(status === 'connected');
        };
        collab.provider.on('status', handleStatus);

        // Also poll awareness on sync
        const handleSync = () => {
            setCollaborators(getCollaborators());
        };
        collab.provider.on('sync', handleSync);

        return () => {
            unsubscribe();
            collab.provider.off('status', handleStatus);
            collab.provider.off('sync', handleSync);
        };
    }, []);

    useEffect(() => {
        // Try to setup immediately if collaboration is ready
        const cleanup = setupListeners();

        // Also register for when collaboration becomes ready
        onCollaborationReady(() => {
            setupListeners();
        });

        return cleanup;
    }, [setupListeners]);

    const totalUsers = collaborators.length + 1; // Include self

    return (
        <div className="flex items-center gap-2">
            {/* Connection indicator */}
            <div
                className={`w-2 h-2 rounded-full transition-colors ${isConnected ? 'bg-green-500' : isReady ? 'bg-yellow-500' : 'bg-gray-300'
                    }`}
                title={isConnected ? 'Connected' : isReady ? 'Connecting...' : 'Initializing...'}
            />

            {/* Avatar stack */}
            <div className="flex -space-x-2">
                {/* Current user */}
                <Avatar
                    name={currentUser.name}
                    color={currentUser.color}
                    initials={getUserInitials(currentUser.name)}
                    isCurrentUser
                />

                {/* Other collaborators */}
                {collaborators.slice(0, 3).map((collab) => (
                    <Avatar
                        key={collab.id}
                        name={collab.name}
                        color={collab.color}
                        initials={getUserInitials(collab.name)}
                        selectedFormName={collab.selectedFormName}
                    />
                ))}

                {/* Overflow count */}
                {collaborators.length > 3 && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium bg-gray-200 text-gray-600 border-2 border-white">
                        +{collaborators.length - 3}
                    </div>
                )}
            </div>

            {/* User count */}
            {totalUsers > 1 && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Users size={12} />
                    {totalUsers}
                </span>
            )}
        </div>
    );
};
