// Autosave hook - saves form to API after debounced changes
import { useEffect } from 'react';
import type { FormNodeStoreApi } from '@/client/store/formStore';

const AUTOSAVE_DELAY_MS = 2000;

export const useAutosave = (store: FormNodeStoreApi | null, formId: string) => {
    useEffect(() => {
        if (!store) return;

        let saveTimer: NodeJS.Timeout | null = null;

        const saveForm = async () => {
            const { elements, markSaved } = store.getState();
            try {
                await fetch(`/api/forms/${formId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ elements }),
                });
                markSaved();
                console.log(`✅ Auto-saved: ${formId}`);
            } catch (err) {
                console.error(`❌ Auto-save failed: ${formId}`, err);
            }
        };

        const unsubscribe = store.subscribe((state) => {
            const current = JSON.stringify(state.elements);
            const saved = state._lastSavedElements;
            if (current === saved) return;

            if (saveTimer) clearTimeout(saveTimer);
            saveTimer = setTimeout(saveForm, AUTOSAVE_DELAY_MS);
        });

        return () => {
            unsubscribe();
            if (saveTimer) clearTimeout(saveTimer);
        };
    }, [store, formId]);
};
