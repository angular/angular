/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { FlamegraphColor, RawData } from 'ngx-flamegraph';
import { ProfilerFrame } from '../../../../../../../../protocol';
import { ThemeService } from '../../../../../application-services/theme_service';
import { FlamegraphNode } from '../../record-formatter/flamegraph-formatter/flamegraph-formatter';
import { SelectedDirective, SelectedEntry } from '../recording-visualizer-types';
export declare class FlamegraphVisualizerComponent {
    themeService: ThemeService;
    readonly profilerBars: import("@angular/core").Signal<FlamegraphNode[]>;
    view: [number, number];
    private readonly _formatter;
    readonly colors: import("@angular/core").Signal<FlamegraphColor>;
    readonly nodeSelect: import("@angular/core").OutputEmitterRef<SelectedEntry>;
    readonly frame: import("@angular/core").InputSignal<ProfilerFrame>;
    readonly changeDetection: import("@angular/core").InputSignal<boolean>;
    selectFrame(frame: RawData): void;
    formatEntryData(flameGraphNode: FlamegraphNode): SelectedDirective[];
}
