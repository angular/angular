/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ɵDeferBlockDetails as DeferBlockDetails, ɵDeferBlockState as DeferBlockState } from '../../src/core';
import type { ComponentFixture } from './component_fixture';
/**
 * Represents an individual defer block for testing purposes.
 *
 * @publicApi
 */
export declare class DeferBlockFixture {
    private block;
    private componentFixture;
    /** @docs-private */
    constructor(block: DeferBlockDetails, componentFixture: ComponentFixture<unknown>);
    /**
     * Renders the specified state of the defer fixture.
     * @param state the defer state to render
     */
    render(state: DeferBlockState): Promise<void>;
    /**
     * Retrieves all nested child defer block fixtures
     * in a given defer block.
     */
    getDeferBlocks(): Promise<DeferBlockFixture[]>;
}
