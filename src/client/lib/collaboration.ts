// Collaboration - Presence/awareness via Yjs (content sync moved to useYjsSync.ts)
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { getUser, type User } from '@/client/lib/user';

export interface Collaborator {
    id: string;
    name: string;
    color: string;
    selectedElementId?: string | null;
    selectedNodeId?: string | null;
    selectedFormName?: string | null;
}

interface AwarenessState {
    doc: Y.Doc;
    provider: WebsocketProvider;
    user: User;
    awareness: WebsocketProvider['awareness'];
}

let awarenessState: AwarenessState | null = null;

export function initCollaboration(roomId: string): AwarenessState {
    if (awarenessState) {
        destroyCollaboration();
    }

    const user = getUser();
    const doc = new Y.Doc();
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws`;

    const provider = new WebsocketProvider(wsUrl, `awareness-${roomId}`, doc, {
        connect: true,
    });

    provider.awareness.setLocalStateField('user', {
        id: user.id,
        name: user.name,
        color: user.color,
        selectedElementId: null,
        selectedNodeId: null,
        selectedFormName: null,
    });

    awarenessState = { doc, provider, user, awareness: provider.awareness };
    console.log('🔗 Awareness connected:', roomId);

    return awarenessState;
}

export function destroyCollaboration(): void {
    if (awarenessState) {
        awarenessState.provider.disconnect();
        awarenessState.doc.destroy();
        awarenessState = null;
        console.log('🔌 Awareness disconnected');
    }
}

export function setSelectedElement(elementId: string | null): void {
    if (!awarenessState) return;
    const currentUser = awarenessState.awareness.getLocalState()?.user || {};
    awarenessState.awareness.setLocalStateField('user', {
        ...currentUser,
        selectedElementId: elementId,
    });
}

export function setSelectedNode(nodeId: string | null, formName?: string | null): void {
    if (!awarenessState) return;
    const currentUser = awarenessState.awareness.getLocalState()?.user || {};
    awarenessState.awareness.setLocalStateField('user', {
        ...currentUser,
        selectedNodeId: nodeId,
        selectedFormName: formName ?? null,
    });
}

export function getCollaborators(): Collaborator[] {
    if (!awarenessState) return [];

    const collaborators: Collaborator[] = [];
    const localUserId = awarenessState.user.id;

    awarenessState.awareness.getStates().forEach((state) => {
        if (state.user && state.user.id !== localUserId) {
            collaborators.push({
                id: state.user.id,
                name: state.user.name,
                color: state.user.color,
                selectedElementId: state.user.selectedElementId,
                selectedNodeId: state.user.selectedNodeId,
                selectedFormName: state.user.selectedFormName,
            });
        }
    });

    return collaborators;
}

export function getCollaboratorOnElement(elementId: string): Collaborator | null {
    return getCollaborators().find(c => c.selectedElementId === elementId) || null;
}

export function onCollaboratorsChange(callback: (collaborators: Collaborator[]) => void): () => void {
    if (!awarenessState) return () => { };

    const handler = () => callback(getCollaborators());
    awarenessState.awareness.on('change', handler);

    return () => {
        awarenessState?.awareness.off('change', handler);
    };
}
