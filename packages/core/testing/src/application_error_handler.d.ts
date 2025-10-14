/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare const RETHROW_APPLICATION_ERRORS_DEFAULT = true;
export declare class TestBedApplicationErrorHandler {
    private readonly zone;
    private readonly injector;
    private userErrorHandler?;
    readonly whenStableRejectFunctions: Set<(e: unknown) => void>;
    handleError(e: unknown): void;
}
