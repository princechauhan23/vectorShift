// toolbar.js

import { useState } from 'react';
import { Plus, Workflow } from 'lucide-react';
import { DraggableNode } from './draggableNode';
import { useNodeDefinitionStore } from '../stores/nodeDefinitionStore';
import { Button } from '@/components/ui/button';
import CreateNodeModal from './CreateNodeModal';
import '../index.css';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

// VectorShift Logo Component
const VectorShiftLogo = () => (
    <div className="flex items-center gap-2">
        <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Workflow className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
        </div>
        <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight bg-linear-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                VectorShift
            </span>
            <span className="text-[10px] text-gray-400 font-medium -mt-0.5 tracking-wide">
                Pipeline Builder
            </span>
        </div>
    </div>
);

const PipelineToolbar = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Get toolbar nodes from Zustand store (reactive + persisted)
    const toolbarNodes = useNodeDefinitionStore((state) => state.toolbarNodes);

    const handleCreateNode = (createdNode) => {
        console.log('Node created successfully:', createdNode);
        // Node has been saved to the backend via the modal's API call
    };

    return (
        <div className="bg-white border-b border-gray-100 shadow-sm">
            {/* Header with Logo */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50">
                <VectorShiftLogo />
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="VS" />
                    <AvatarFallback>VS</AvatarFallback>
                </Avatar>
            </div>

            {/* Nodes Toolbar */}
            <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">
                        Nodes
                    </span>
                    <div className="h-px bg-gray-200 w-8" />
                    <div className="flex flex-row gap-2 overflow-x-auto py-1 px-1 flex-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        {toolbarNodes.map((node) => (
                            <DraggableNode key={node.type} type={node.type} label={node.label} />
                        ))}
                        {toolbarNodes.length === 0 && (
                            <span className="text-sm text-gray-400 italic">
                                Loading nodes...
                            </span>
                        )}
                    </div>
                </div>
                <div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium px-4 py-2 rounded-lg shadow-md shadow-violet-500/20 transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/30"
                    >
                        <Plus className="w-4 h-4" strokeWidth={2.5} />
                        <span>Create Node</span>
                    </Button>
                </div>
            </div>

            {isModalOpen && (
                <CreateNodeModal
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    onSubmit={handleCreateNode}
                />
            )}
        </div>
    );
};

export default PipelineToolbar;
