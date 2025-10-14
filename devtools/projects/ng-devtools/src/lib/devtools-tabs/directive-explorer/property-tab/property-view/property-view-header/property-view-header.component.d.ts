/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare class PropertyViewHeaderComponent {
    readonly directive: import("@angular/core").InputSignal<string>;
    readonly viewSource: import("@angular/core").OutputEmitterRef<void>;
    private readonly frameManager;
    private readonly platform;
    readonly disableViewSourceButton: import("@angular/core").Signal<boolean>;
    protected readonly viewSourceTooltip: import("@angular/core").Signal<"Inspecting source is not supported in Firefox when the inspected frame is not the top-level frame." | "Open Source">;
    handleViewSource(event: MouseEvent): void;
}
