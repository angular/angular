/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare abstract class GraphRenderer<T, U> {
    abstract render(root: T): void;
    abstract getInternalNodeById(id: string): U | null;
    abstract snapToNode(node: T): void;
    abstract snapToRoot(): void;
    abstract zoomScale(scale: number): void;
    abstract root: U | null;
    protected nodeClickListeners: ((pointerEvent: PointerEvent, internalNode: U) => void)[];
    protected nodeMouseoverListeners: ((pointerEvent: PointerEvent, internalNode: U) => void)[];
    protected nodeMouseoutListeners: ((pointerEvent: PointerEvent, internalNode: U) => void)[];
    cleanup(): void;
    dispose(): void;
    onNodeClick(cb: (pointerEvent: PointerEvent, internalNode: U) => void): void;
    onNodeMouseover(cb: (pointerEvent: PointerEvent, internalNode: U) => void): void;
    onNodeMouseout(cb: (pointerEvent: PointerEvent, internalNode: U) => void): void;
}
