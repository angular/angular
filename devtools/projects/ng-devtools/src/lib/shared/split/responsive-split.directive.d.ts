/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Direction } from './interface';
export declare const RESIZE_DEBOUNCE = 50;
export type ResponsiveSplitConfig = {
    /** Default direction of the as-split (when < `aspectRatioBreakpoint`) */
    defaultDirection: Direction;
    /** Width to height ratio. If greater than or equal, `breakpointDirection` is applied. */
    aspectRatioBreakpoint: number;
    /** Default direction of the as-split (when >= `aspectRatioBreakpoint`) */
    breakpointDirection: Direction;
};
/** Make as-split direction responsive. */
export declare class ResponsiveSplitDirective {
    private readonly host;
    private readonly elementRef;
    private readonly window;
    protected readonly config: import("@angular/core").InputSignal<ResponsiveSplitConfig>;
    protected readonly directionChange: import("@angular/core").OutputEmitterRef<Direction>;
    constructor();
    private applyDirection;
}
