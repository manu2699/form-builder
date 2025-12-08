import { useParams, Link } from 'react-router-dom';
import { DndContext, DragOverlay, useSensor, useSensors, MouseSensor, type DragStartEvent, type DragEndEvent, closestCenter } from '@dnd-kit/core';

import { BuilderLayout } from '../components/builder/BuilderLayout';
import { Toolbar } from '../components/builder/Toolbar';
import { PropertyPanel } from '../components/properties';
import { CollaboratorAvatars } from '../components/collaboration';

import { useBuilderStore, type FormElement } from '../store/builderStore';
import { useEffect, useState, useRef } from 'react';
import { Save } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { renderFieldPreview } from '../components/fields';
import {
    initCollaboration,
    destroyCollaboration,
    onElementsChange,
    syncElementsToYjs,
    getCollaboration
} from '../lib/collaboration';

export const BuilderPage = () => {
    const { formId } = useParams();
    const { addElement, setActiveId, elements, reorderElements, setElements } = useBuilderStore();
    const [saving, setSaving] = useState(false);
    const [formName, setFormName] = useState<string>('');
    const [activeDragItem, setActiveDragItem] = useState<FormElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    );

    // Update cursor during drag
    useEffect(() => {
        if (isDragging) {
            document.body.style.cursor = 'grabbing';
        } else {
            document.body.style.cursor = '';
        }
        return () => {
            document.body.style.cursor = '';
        };
    }, [isDragging]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);
        setIsDragging(true);
        document.body.classList.add('dragging');

        if (active.data.current?.type === 'sidebar-item') {
            const payload = active.data.current.payload;
            setActiveDragItem({
                id: 'preview',
                type: payload.type,
                label: payload.label,
                colSpan: 1,
                properties: {},
            });
        } else if (active.data.current?.type === 'grid-element') {
            setActiveDragItem(active.data.current.element);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        document.body.classList.remove('dragging');
        setIsDragging(false);

        if (!over) {
            setActiveId(null);
            setActiveDragItem(null);
            return;
        }

        const activeData = active.data.current;
        const overData = over.data.current;

        // Dropping a sidebar item into the grid (any drop target works)
        if (activeData?.type === 'sidebar-item') {
            const type = activeData.payload.type;
            addElement(type);
        }

        // Reordering grid elements
        if (activeData?.type === 'grid-element') {
            const fromIndex = activeData.index;
            let toIndex = fromIndex;

            // Dropped over another grid element
            if (overData?.type === 'grid-element' && overData.index !== fromIndex) {
                toIndex = overData.index;
            }
            // Dropped over empty zone (move to end)
            else if (over.id === 'add-zone' || over.id === 'empty-zone') {
                toIndex = elements.length - 1;
            }

            if (fromIndex !== toIndex) {
                reorderElements(fromIndex, toIndex);
            }
        }

        setActiveId(null);
        setActiveDragItem(null);
    };

    // Load Form
    useEffect(() => {
        formId && fetchForm(formId);
    }, [formId]);

    // Initialize collaboration
    const isCollabInitialized = useRef(false);
    useEffect(() => {
        if (formId && !isCollabInitialized.current) {
            isCollabInitialized.current = true;
            initCollaboration(formId);

            // Listen for remote element changes only
            const unsubscribe = onElementsChange((remoteElements) => {
                console.log('📥 Received remote elements:', remoteElements.length);
                setElements(remoteElements);
            });

            return () => {
                unsubscribe();
                destroyCollaboration();
                isCollabInitialized.current = false;
            };
        }
    }, [formId, setElements]);

    // NOTE: Sync to Yjs is now handled on save only (not on every local change)
    // This prevents the feedback loop with other clients

    const fetchForm = async (formId: string) => {
        if (!formId) return;
        fetch(`/api/forms/${formId}`)
            .then(res => res.json())
            .then(form => {
                setFormName(form.name || formId);
                if (form.layout) {
                    const layoutData = typeof form.layout === 'string' ? JSON.parse(form.layout) : form.layout;
                    setElements(Array.isArray(layoutData) ? layoutData : []);
                }
            })
            .catch(err => console.error("Failed to load form", err));
    }

    // Auto-save with debounce (2 seconds after last change)
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const prevElementsLengthRef = useRef(0);

    useEffect(() => {
        // Only auto-save if elements actually changed (not on initial load)
        if (prevElementsLengthRef.current !== 0 || elements.length > 0) {
            if (prevElementsLengthRef.current !== elements.length) {
                prevElementsLengthRef.current = elements.length;

                // Clear existing timeout
                if (saveTimeoutRef.current) {
                    clearTimeout(saveTimeoutRef.current);
                }

                // Set new timeout for auto-save
                saveTimeoutRef.current = setTimeout(() => {
                    saveForm();
                }, 2000);
            }
        }

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [elements.length]);

    const saveForm = async () => {
        if (!formId) return;
        setSaving(true);
        try {
            // Sync to Yjs first
            syncElementsToYjs(elements);

            // Then save to database
            await fetch(`/api/forms/${formId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    layout: elements,
                    schema: []
                })
            });
            console.log('💾 Form saved');
        } catch (err) {
            console.error("Failed to save", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="h-full w-full flex flex-col bg-white">
                <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10 bg-white">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-sm font-medium text-gray-500 hover:text-black transition-colors flex items-center gap-1">
                            ← Back
                        </Link>
                        <div className="h-6 w-px bg-gray-200 mx-2"></div>
                        <h1 className="font-bold text-lg tracking-tight">{formName || 'Loading...'}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <CollaboratorAvatars />
                        <div className="h-6 w-px bg-gray-200"></div>
                        <Button variant="outline" size="sm" onClick={() => window.open(`/preview/${formId}`, '_blank')}>Preview</Button>
                        <Button onClick={saveForm} disabled={saving} size="sm" className="gap-2">
                            <Save size={16} />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
                <div className="flex-1 flex overflow-hidden">
                    <Toolbar />
                    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
                        <div className="max-w-4xl mx-auto">
                            <BuilderLayout />
                        </div>
                    </div>
                    <PropertyPanel />
                </div>
            </div>

            {/* Drag Overlay - positioned at cursor */}
            <DragOverlay dropAnimation={null}>
                {activeDragItem ? (
                    <div className="bg-white border-1 border-black shadow-2xl w-[250px] pointer-events-none flex p-2">
                        <div className="text-sm font-medium text-gray-700">{activeDragItem.label}</div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

