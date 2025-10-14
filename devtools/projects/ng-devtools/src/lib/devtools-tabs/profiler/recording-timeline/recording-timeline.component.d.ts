/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ProfilerFrame } from '../../../../../../protocol';
import { Observable } from 'rxjs';
import { VisualizationMode } from './shared/visualization-mode';
export declare class RecordingTimelineComponent {
    readonly stream: import("@angular/core").InputSignal<Observable<ProfilerFrame[]>>;
    readonly exportProfile: import("@angular/core").OutputEmitterRef<void>;
    readonly visualizationMode: import("@angular/core").WritableSignal<VisualizationMode>;
    readonly changeDetection: import("@angular/core").WritableSignal<boolean>;
    readonly selectFrames: import("@angular/core").WritableSignal<number[]>;
    readonly frame: import("@angular/core").Signal<ProfilerFrame | null>;
    private readonly _filter;
    protected readonly visualizing: import("@angular/core").WritableSignal<boolean>;
    private readonly allFrames;
    protected readonly frames: import("@angular/core").Signal<ProfilerFrame[]>;
    readonly currentFrameRate: import("@angular/core").Signal<number>;
    readonly hasFrames: import("@angular/core").Signal<boolean>;
    constructor();
    setFilter(filter: string): void;
}
