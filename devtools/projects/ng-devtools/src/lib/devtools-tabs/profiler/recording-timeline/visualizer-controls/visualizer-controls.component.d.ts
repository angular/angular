/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ProfilerFrame } from '../../../../../../../protocol';
import { VisualizationMode } from '../shared/visualization-mode';
export declare class VisualizerControlsComponent {
    protected readonly record: import("@angular/core").InputSignal<ProfilerFrame>;
    protected readonly estimatedFrameRate: import("@angular/core").InputSignal<number>;
    protected readonly visualizationMode: import("@angular/core").ModelSignal<VisualizationMode>;
    protected readonly changeDetection: import("@angular/core").ModelSignal<boolean>;
    protected readonly VisMode: typeof VisualizationMode;
    protected onVisualizationChange(value: string): void;
}
