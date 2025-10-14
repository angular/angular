/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { MatDialog } from '@angular/material/dialog';
import { ProfilerFrame } from '../../../../../protocol';
import { Subject } from 'rxjs';
type State = 'idle' | 'recording' | 'visualizing';
export declare class ProfilerComponent {
    readonly state: import("@angular/core").WritableSignal<State>;
    stream: Subject<ProfilerFrame[]>;
    private _buffer;
    private _fileApiService;
    private _messageBus;
    dialog: MatDialog;
    constructor();
    startRecording(): void;
    stopRecording(): void;
    exportProfilerResults(): void;
    importProfilerResults(event: Event): void;
    discardRecording(): void;
}
export {};
