/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ElementRef } from '@angular/core';
import { FlatNode } from '../component-data-source';
export declare class BreadcrumbsComponent {
    readonly parents: import("@angular/core").InputSignal<FlatNode[]>;
    readonly handleSelect: import("@angular/core").OutputEmitterRef<FlatNode>;
    readonly mouseOverNode: import("@angular/core").OutputEmitterRef<FlatNode>;
    readonly mouseLeaveNode: import("@angular/core").OutputEmitterRef<FlatNode>;
    readonly breadcrumbsScrollContent: import("@angular/core").Signal<ElementRef<any>>;
    readonly showScrollLeftButton: import("@angular/core").Signal<boolean | undefined>;
    readonly showScrollRightButton: import("@angular/core").Signal<boolean>;
    private readonly breadcrumbsScrollLayout;
    constructor();
    scroll(pixels: number): void;
    updateScrollButtonVisibility(): void;
}
