/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { OnInit } from '@angular/core';
export declare class AppComponent implements OnInit {
    private _cd;
    private readonly _messageBus;
    private onProfilingStartedListener;
    private onProfilingStoppedListener;
    ngOnInit(): void;
    ngOnDestroy(): void;
}
