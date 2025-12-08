// Collaboration - Yjs integration with WebSocket provider
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { getUser, type User } from './user';
import type { FormElement } from '../store/builderStore';

export interface Collaborator {
    id: string;
    name: string;
    color: string;
    selectedElementId?: string | null;
}

export interface CollaborationState {
    doc: Y.Doc;
    provider: WebsocketProvider;
    elements: Y.Array<FormElement>;
    user: User;
    awareness: WebsocketProvider['awareness'];
}

let collaborationState: CollaborationState | null = null;
let readyCallbacks: (() => void)[] = [];

export function initCollaboration(formId: string): CollaborationState {
    // Clean up existing connection if any
    if (collaborationState) {
        destroyCollaboration();
    }

    const user = getUser();
    const doc = new Y.Doc();

    // Get WebSocket URL - y-websocket appends room name to this URL
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws`;

    // Create provider with form-specific room
    const provider = new WebsocketProvider(wsUrl, `form-${formId}`, doc, {
        connect: true,
    });

    // Set user awareness
    provider.awareness.setLocalStateField('user', {
        id: user.id,
        name: user.name,
        color: user.color,
        selectedElementId: null,
    });

    // Get shared elements array
    const elements = doc.getArray<FormElement>('elements');

    collaborationState = {
        doc,
        provider,
        elements,
        user,
        awareness: provider.awareness,
    };

    console.log('🔗 Collaboration initialized for form:', formId);

    // Notify any waiting callbacks
    readyCallbacks.forEach(cb => cb());
    readyCallbacks = [];

    return collaborationState;
}

export function getCollaboration(): CollaborationState | null {
    return collaborationState;
}

// Wait for collaboration to be ready
export function onCollaborationReady(callback: () => void): void {
    if (collaborationState) {
        callback();
    } else {
        readyCallbacks.push(callback);
    }
}

export function destroyCollaboration(): void {
    if (collaborationState) {
        collaborationState.provider.disconnect();
        collaborationState.doc.destroy();
        collaborationState = null;
        console.log('🔌 Collaboration destroyed');
    }
}

// Update local user's selected element
export function setSelectedElement(elementId: string | null): void {
    if (!collaborationState) return;
    collaborationState.awareness.setLocalStateField('user', {
        ...collaborationState.user,
        selectedElementId: elementId,
    });
}

// Get list of connected collaborators with their selections
export function getCollaborators(): Collaborator[] {
    if (!collaborationState) return [];

    const collaborators: Collaborator[] = [];
    const localUserId = collaborationState.user.id;

    collaborationState.awareness.getStates().forEach((state) => {
        if (state.user && state.user.id !== localUserId) {
            collaborators.push({
                id: state.user.id,
                name: state.user.name,
                color: state.user.color,
                selectedElementId: state.user.selectedElementId,
            });
        }
    });

    return collaborators;
}

// Get collaborator editing a specific element
export function getCollaboratorOnElement(elementId: string): Collaborator | null {
    const collaborators = getCollaborators();
    return collaborators.find(c => c.selectedElementId === elementId) || null;
}

// Subscribe to collaborator changes
export function onCollaboratorsChange(callback: (collaborators: Collaborator[]) => void): () => void {
    if (!collaborationState) return () => { };

    const handler = () => {
        callback(getCollaborators());
    };

    collaborationState.awareness.on('change', handler);
    return () => {
        collaborationState?.awareness.off('change', handler);
    };
}

// Subscribe to elements changes from remote ONLY
export function onElementsChange(callback: (elements: FormElement[]) => void): () => void {
    if (!collaborationState) return () => { };

    const handler = (event: Y.YArrayEvent<FormElement>, transaction: Y.Transaction) => {
        // Ignore local transactions (from our own edits)
        if (transaction.local) {
            return;
        }

        console.log('📥 Remote change detected');
        callback(collaborationState!.elements.toArray());
    };

    collaborationState.elements.observe(handler);
    return () => {
        collaborationState?.elements.unobserve(handler);
    };
}

// Sync local elements to Yjs
export function syncElementsToYjs(elements: FormElement[]): void {
    if (!collaborationState) return;

    const yjsElements = collaborationState.elements;

    collaborationState.doc.transact(() => {
        while (yjsElements.length > 0) {
            yjsElements.delete(0);
        }
        elements.forEach(el => yjsElements.push([el]));
    });

    console.log('📤 Synced elements to Yjs:', elements.length);
}

// Load elements from Yjs
export function getElementsFromYjs(): FormElement[] {
    if (!collaborationState) return [];
    return collaborationState.elements.toArray();
}
