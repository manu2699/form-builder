// Canvas - Infinite pan/zoom canvas for form nodes
import { useState, useRef, useCallback, type ReactNode, type WheelEvent, type MouseEvent } from 'react';

interface CanvasProps {
    children: ReactNode;
    minZoom?: number;
    maxZoom?: number;
}

interface Transform {
    x: number;
    y: number;
    scale: number;
}

export const Canvas = ({ children, minZoom = 0.5, maxZoom = 2 }: CanvasProps) => {
    const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const lastPanPoint = useRef({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);

    // Handle mouse wheel zoom
    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();

        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.min(maxZoom, Math.max(minZoom, transform.scale * delta));

        // Zoom toward cursor position
        if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const scaleChange = newScale / transform.scale;
            setTransform({
                scale: newScale,
                x: x - (x - transform.x) * scaleChange,
                y: y - (y - transform.y) * scaleChange,
            });
        }
    }, [transform, minZoom, maxZoom]);

    // Handle pan start
    const handleMouseDown = useCallback((e: MouseEvent) => {
        // Only pan if clicking directly on canvas (not on nodes)
        if (e.target === canvasRef.current || (e.target as HTMLElement).dataset.canvasBackground) {
            setIsPanning(true);
            lastPanPoint.current = { x: e.clientX, y: e.clientY };
            e.preventDefault();
        }
    }, []);

    // Handle pan move
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isPanning) return;

        const dx = e.clientX - lastPanPoint.current.x;
        const dy = e.clientY - lastPanPoint.current.y;
        lastPanPoint.current = { x: e.clientX, y: e.clientY };

        setTransform(prev => ({
            ...prev,
            x: prev.x + dx,
            y: prev.y + dy,
        }));
    }, [isPanning]);

    // Handle pan end
    const handleMouseUp = useCallback(() => {
        setIsPanning(false);
    }, []);

    // Reset view
    const resetView = useCallback(() => {
        setTransform({ x: 0, y: 0, scale: 1 });
    }, []);

    return (
        <div
            ref={canvasRef}
            className="relative w-full h-full overflow-hidden bg-gray-100"
            onWheel={handleWheel}
        >
            {/* Clickable background layer for panning - behind everything */}
            <div
                data-canvas-background
                className="absolute inset-0"
                style={{
                    cursor: isPanning ? 'grabbing' : 'grab',
                    backgroundImage: `radial-gradient(circle, #d1d5db 1px, transparent 1px)`,
                    backgroundSize: `${20 * transform.scale}px ${20 * transform.scale}px`,
                    backgroundPosition: `${transform.x}px ${transform.y}px`,
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />

            {/* Transformed content container - children are interactive */}
            <div
                className="absolute origin-top-left pointer-events-none"
                style={{
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                    transformOrigin: '0 0',
                }}
            >
                {/* Each child should have pointer-events-auto */}
                <div className="pointer-events-auto">
                    {children}
                </div>
            </div>

            {/* Zoom controls */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white border border-gray-200 rounded-lg shadow-sm px-2 py-1">
                <button
                    onClick={() => setTransform(prev => ({ ...prev, scale: Math.max(minZoom, prev.scale * 0.8) }))}
                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
                >
                    −
                </button>
                <span className="text-xs text-gray-500 w-12 text-center">
                    {Math.round(transform.scale * 100)}%
                </span>
                <button
                    onClick={() => setTransform(prev => ({ ...prev, scale: Math.min(maxZoom, prev.scale * 1.2) }))}
                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
                >
                    +
                </button>
                <div className="w-px h-4 bg-gray-200" />
                <button
                    onClick={resetView}
                    className="px-2 h-7 text-xs text-gray-600 hover:bg-gray-100 rounded"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};
