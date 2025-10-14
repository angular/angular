/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { LView } from '../render3/interfaces/view';
import { DehydratedDeferBlock, TDeferBlockDetails } from './interfaces';
/**
 * Defer block instance for testing.
 */
export interface DeferBlockDetails extends DehydratedDeferBlock {
    tDetails: TDeferBlockDetails;
}
/**
 * Retrieves all defer blocks in a given LView.
 *
 * @param lView lView with defer blocks
 * @param deferBlocks defer block aggregator array
 */
export declare function getDeferBlocks(lView: LView, deferBlocks: DeferBlockDetails[]): void;
