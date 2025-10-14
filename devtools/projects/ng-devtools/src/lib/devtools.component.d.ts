/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { OnDestroy } from '@angular/core';
import { Frame } from './application-environment';
declare enum AngularStatus {
    /**
     * This page may have Angular but we don't know yet. We're still trying to detect it.
     */
    UNKNOWN = 0,
    /**
     * We've given up on trying to detect Angular. We tried ${DETECT_ANGULAR_ATTEMPTS} times and
     * failed.
     */
    DOES_NOT_EXIST = 1,
    /**
     * Angular was detected somewhere on the page.
     */
    EXISTS = 2
}
export declare class DevToolsComponent implements OnDestroy {
    protected readonly supportedApis: import("./application-providers/supported_apis").SupportedApisSignal;
    readonly AngularStatus: typeof AngularStatus;
    readonly angularStatus: import("@angular/core").WritableSignal<AngularStatus>;
    readonly angularVersion: import("@angular/core").WritableSignal<string | undefined>;
    readonly angularIsInDevMode: import("@angular/core").WritableSignal<boolean>;
    readonly hydration: import("@angular/core").WritableSignal<boolean>;
    readonly ivy: import("@angular/core").WritableSignal<boolean | undefined>;
    readonly supportedVersion: import("@angular/core").Signal<boolean | undefined>;
    private readonly _messageBus;
    private readonly _frameManager;
    private _interval$;
    constructor();
    inspectFrame(frame: Frame): void;
    ngOnDestroy(): void;
}
export {};
