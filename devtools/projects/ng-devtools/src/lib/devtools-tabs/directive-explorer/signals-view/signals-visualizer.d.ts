/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DebugSignalGraph, DebugSignalGraphNode } from '../../../../../../protocol';
import * as d3 from 'd3';
export declare class SignalsGraphVisualizer {
    private svg;
    private graph;
    private drender;
    zoomController: d3.ZoomBehavior<SVGSVGElement, unknown>;
    private animationMap;
    private timeouts;
    private nodeClickListeners;
    constructor(svg: SVGSVGElement);
    setSelected(selected: string | null): void;
    zoomScale(scale: number): void;
    cleanup(): void;
    updateNodeAnimations(updatedNodes: string[], timeout: ReturnType<typeof setTimeout>): void;
    reset(): void;
    render(injectorGraph: DebugSignalGraph): void;
    resize(): void;
    /**
     * Listen for node clicks.
     *
     * @param cb Callback/listener
     * @returns An unlisten function
     */
    onNodeClick(cb: (node: DebugSignalGraphNode) => void): () => void;
}
