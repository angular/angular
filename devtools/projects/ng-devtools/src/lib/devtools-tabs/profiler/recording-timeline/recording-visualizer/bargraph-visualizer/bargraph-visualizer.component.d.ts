/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ProfilerFrame } from '../../../../../../../../protocol';
import { BargraphNode } from '../../record-formatter/bargraph-formatter/index';
import { SelectedDirective, SelectedEntry } from '../recording-visualizer-types';
export declare class BargraphVisualizerComponent {
    readonly nodeSelect: import("@angular/core").OutputEmitterRef<SelectedEntry>;
    private readonly _formatter;
    frame: import("@angular/core").InputSignal<ProfilerFrame>;
    profileRecords: import("@angular/core").Signal<BargraphNode[]>;
    formatEntryData(bargraphNode: BargraphNode): SelectedDirective[];
    selectNode(node: BargraphNode): void;
}
