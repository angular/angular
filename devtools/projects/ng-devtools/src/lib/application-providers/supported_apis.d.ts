/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { InjectionToken } from '@angular/core';
import { SupportedApis } from '../../../../protocol';
/** A signal derivative containing all DevTools supported APIs.  */
export interface SupportedApisSignal {
    /** Returns the supported APIs read-only signal. */
    (): SupportedApis;
    /** Initialize (set once) the supported APIs. */
    init: (supportedApis: SupportedApis) => void;
}
export declare const SUPPORTED_APIS: InjectionToken<SupportedApisSignal>;
