/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ElementRef, TemplateRef, ViewContainerRef } from '@angular/core';
import { ZippyComponent } from './zippy.component';
export declare class StructuralDirective {
    templateRef: TemplateRef<any>;
    viewContainerRef: ViewContainerRef;
    ngOnInit(): void;
}
export declare class DemoAppComponent {
    readonly zippy: import("@angular/core").Signal<ZippyComponent | undefined>;
    readonly elementRef: import("@angular/core").Signal<ElementRef<any> | undefined>;
    readonly inputOne: import("@angular/core").InputSignal<string>;
    readonly inputTwo: import("@angular/core").InputSignal<string>;
    readonly outputOne: import("@angular/core").OutputEmitterRef<void>;
    readonly outputTwo: import("@angular/core").OutputEmitterRef<void>;
    primitiveSignal: import("@angular/core").WritableSignal<number>;
    primitiveComputed: import("@angular/core").Signal<number>;
    objectSignal: import("@angular/core").WritableSignal<{
        name: string;
        age: number;
    }>;
    objectComputed: import("@angular/core").Signal<{
        age: number;
        name: string;
    }>;
    getTitle(): '► Click to expand' | '▼ Click to collapse';
    constructor();
}
