/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ProfilerFrame } from '../../../../../../../protocol';
import { VisualizationMode } from '../shared/visualization-mode';
import { SelectedEntry } from './recording-visualizer-types';
export declare class RecordingVisualizerComponent {
    readonly visualizationMode: import("@angular/core").InputSignal<VisualizationMode>;
    readonly frame: import("@angular/core").InputSignal<ProfilerFrame>;
    readonly changeDetection: import("@angular/core").InputSignal<boolean>;
    readonly cmpVisualizationModes: typeof VisualizationMode;
    private readonly selectedNode;
    readonly selectedEntry: import("@angular/core").Signal<import("../record-formatter/bargraph-formatter").BargraphNode | import("../record-formatter/flamegraph-formatter").FlamegraphNode | null>;
    readonly selectedDirectives: import("@angular/core").Signal<import("./recording-visualizer-types").SelectedDirective[]>;
    readonly parentHierarchy: import("@angular/core").Signal<{
        name: string;
    }[]>;
    selectNode(selected: SelectedEntry): void;
}
