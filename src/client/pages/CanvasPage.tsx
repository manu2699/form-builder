import React, { useCallback, useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { ReactFlow, Background, Controls, useNodesState, useEdgesState, BackgroundVariant, type Node, type Edge } from '@xyflow/react';
import { FileText, Plus } from 'lucide-react';
import { nanoid } from 'nanoid';

import { Button } from '@/client/components/ui/Button';
import { Card } from '@/client/components/ui/Card';
import { CreateFormModal } from '@/client/components/ui/Modal';

import '@xyflow/react/dist/style.css';

// Custom Form Node Component
const FormNode = ({ data }: { data: { label: string; id: string } }) => {
    return (
        <Card className="min-w-[200px] hover:border-black transition-colors cursor-pointer group">
            <div className="p-4 flex items-center gap-3">
                <div className="p-2 bg-gray-100 text-gray-900 group-hover:bg-black group-hover:text-white transition-colors">
                    <FileText size={20} />
                </div>
                <div className="font-semibold">{data.label}</div>
            </div>
            <div className="px-4 pb-4 text-xs text-gray-500">Last edited just now</div>
        </Card>
    );
};

const nodeTypes = {
    form: FormNode,
};

export const CanvasPage = () => {
    const navigate = useNavigate();
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Fetch forms
    useEffect(() => {
        fetch('/api/forms')
            .then(res => res.json())
            .then(forms => {
                const newNodes = forms.map((form: any, index: number) => ({
                    id: form.id,
                    type: 'form',
                    position: { x: 100 + (index * 260), y: 100 },
                    data: { label: form.name, id: form.id }
                }));
                setNodes(newNodes);
            })
            .catch(err => console.error("Failed to fetch forms", err));
    }, [setNodes]);

    const handleCreateForm = async (name: string) => {
        const id = nanoid();
        try {
            const res = await fetch('/api/forms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name })
            });
            const form = await res.json();
            const newNode: Node = {
                id: form.id,
                type: 'form',
                position: { x: 100 + (nodes.length * 260), y: 100 },
                data: { label: form.name, id: form.id }
            };
            setNodes((nds) => [...nds, newNode]);
        } catch (e) {
            console.error("Failed to create form", e);
        }
    };

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        navigate(`/builder/${node.id}`);
    }, [navigate]);

    return (
        <div className="h-full w-full flex flex-col bg-white">
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10 bg-white">
                <div className="flex items-center gap-2">
                    <h1 className="font-bold text-xl tracking-tight">Forms</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                        <Plus size={16} /> New Form
                    </Button>
                </div>
            </div>

            <div className="flex-1 w-full relative bg-gray-50">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    onNodeClick={onNodeClick}
                    fitView
                    className="bg-gray-50"
                >
                    <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e5e7eb" />
                    <Controls className="!bg-white !border-gray-200 !shadow-sm" />
                </ReactFlow>
            </div>

            <CreateFormModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateForm}
            />
        </div>
    );
};
