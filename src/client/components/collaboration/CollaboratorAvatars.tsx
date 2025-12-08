// Collaborator Avatars - Shows connected users
import React, { useEffect, useState, useCallback } from 'react';
import { Users } from 'lucide-react';
import {
    getCollaborators,
    onCollaboratorsChange,
    getCollaboration,
    onCollaborationReady,
    type Collaborator
} from '../../lib/collaboration';
import { getUser, getUserInitials } from '../../lib/user';

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
                <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-white shadow-sm"
                    style={{ backgroundColor: currentUser.color }}
                    title={`${currentUser.name} (You)`}
                >
                    {getUserInitials(currentUser.name)}
                </div>

                {/* Other collaborators */}
                {collaborators.slice(0, 3).map((collab) => (
                    <div
                        key={collab.id}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-white shadow-sm"
                        style={{ backgroundColor: collab.color }}
                        title={collab.name}
                    >
                        {getUserInitials(collab.name)}
                    </div>
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
