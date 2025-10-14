/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ElementRef, OnDestroy } from '@angular/core';
import { ProfilerFrame } from '../../../../../../../../protocol';
export declare class TreeMapVisualizerComponent implements OnDestroy {
    private _formatter;
    readonly frame: import("@angular/core").InputSignal<ProfilerFrame>;
    private resize$;
    private _throttledResizeSubscription;
    private _resizeObserver;
    private readonly treeMapRecords;
    readonly tree: import("@angular/core").Signal<ElementRef<HTMLElement>>;
    constructor();
    ngOnDestroy(): void;
    private _renderTree;
    private _removeTree;
    private _createTree;
}
