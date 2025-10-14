/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/** Retrieved information about a `@defer` block. */
export interface DeferBlockData {
    /** Current state of the block. */
    state: 'placeholder' | 'loading' | 'complete' | 'error' | 'initial';
    /** Hydration state of the block. */
    incrementalHydrationState: 'not-configured' | 'hydrated' | 'dehydrated';
    /** Wherther the block has a connected `@error` block. */
    hasErrorBlock: boolean;
    /** Information about the connected `@loading` block. */
    loadingBlock: {
        /** Whether the block is defined. */
        exists: boolean;
        /** Minimum amount of milliseconds that the block should be shown. */
        minimumTime: number | null;
        /** Amount of time after which the block should be shown. */
        afterTime: number | null;
    };
    /** Information about the connected `@placeholder` block. */
    placeholderBlock: {
        /** Whether the block is defined. */
        exists: boolean;
        /** Minimum amount of time that block should be shown. */
        minimumTime: number | null;
    };
    /** Stringified version of the block's triggers. */
    triggers: string[];
    /** Element root nodes that are currently being shown in the block. */
    rootNodes: Node[];
}
/**
 * Gets all of the `@defer` blocks that are present inside the specified DOM node.
 * @param node Node in which to look for `@defer` blocks.
 *
 * @publicApi
 */
export declare function getDeferBlocks(node: Node): DeferBlockData[];
