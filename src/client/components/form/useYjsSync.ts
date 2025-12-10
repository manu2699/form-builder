// Yjs real-time sync hook
import { useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import type { FormNodeStoreApi, FormElement } from '@/client/store/formStore';

interface YjsState {
    doc: Y.Doc;
    provider: WebsocketProvider;
    elements: Y.Array<FormElement>;
}

export const useYjsSync = (store: FormNodeStoreApi | null, formId: string) => {
    const yjsRef = useRef<YjsState | null>(null);
    const isRemoteUpdateRef = useRef(false);

    useEffect(() => {
        if (!store) return;

        const doc = new Y.Doc();
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.host}/ws`;

        const provider = new WebsocketProvider(wsUrl, `form-${formId}`, doc, {
            connect: true,
        });

        const yjsElements = doc.getArray<FormElement>('elements');
        yjsRef.current = { doc, provider, elements: yjsElements };

        console.log(`🔗 Real-time sync started: ${formId}`);

        provider.on('sync', (isSynced: boolean) => {
            if (!isSynced) return;

            const yjsData = yjsElements.toArray();
            const localData = store.getState().elements;

            if (yjsData.length === 0 && localData.length > 0) {
                doc.transact(() => {
                    localData.forEach(el => yjsElements.push([el]));
                });
                console.log('📤 Pushed local elements to Yjs');
            } else if (yjsData.length > 0) {
                isRemoteUpdateRef.current = true;
                store.getState().setElements(yjsData);
                isRemoteUpdateRef.current = false;
                console.log('📥 Pulled elements from Yjs');
            }
        });

        const yjsObserver = (event: Y.YArrayEvent<FormElement>, transaction: Y.Transaction) => {
            if (transaction.local) return;

            console.log('📥 Remote update received');
            isRemoteUpdateRef.current = true;
            store.getState().setElements(yjsElements.toArray());
            isRemoteUpdateRef.current = false;
        };
        yjsElements.observe(yjsObserver);

        const unsubscribe = store.subscribe((state, prevState) => {
            if (isRemoteUpdateRef.current) return;
            if (JSON.stringify(state.elements) === JSON.stringify(prevState.elements)) return;

            console.log('📤 Syncing local changes to Yjs');
            doc.transact(() => {
                while (yjsElements.length > 0) {
                    yjsElements.delete(0);
                }
                state.elements.forEach(el => yjsElements.push([el]));
            });
        });

        return () => {
            unsubscribe();
            yjsElements.unobserve(yjsObserver);
            provider.disconnect();
            doc.destroy();
            yjsRef.current = null;
            console.log(`🔌 Real-time sync stopped: ${formId}`);
        };
    }, [store, formId]);
};
