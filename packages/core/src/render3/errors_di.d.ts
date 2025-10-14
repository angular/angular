/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { ProviderToken } from '../di';
import { Type } from '../interface/type';
/** Creates a circular dependency runtime error. */
export declare function cyclicDependencyError(token: string, path?: string[]): Error;
/** Creates a circular dependency runtime error including a dependency path in the error message. */
export declare function cyclicDependencyErrorWithDetails(token: string, path: string[]): Error;
export declare function throwMixedMultiProviderError(): void;
export declare function throwInvalidProviderError(ngModuleType?: Type<unknown>, providers?: any[], provider?: any): never;
/** Throws an error when a token is not found in DI. */
export declare function throwProviderNotFoundError(token: ProviderToken<unknown>, injectorName?: string): never;
/**
 * Given an Error instance and the current token - update the monkey-patched
 * dependency path info to include that token.
 *
 * @param error Current instance of the Error class.
 * @param token Extra token that should be appended.
 */
export declare function prependTokenToDependencyPath(error: any, token: ProviderToken<unknown> | {
    multi: true;
    provide: ProviderToken<unknown>;
}): void;
/**
 * Modifies an Error instance with an updated error message
 * based on the accumulated dependency path.
 *
 * @param error Current instance of the Error class.
 * @param source Extra info about the injector which started
 *    the resolution process, which eventually failed.
 */
export declare function augmentRuntimeError(error: any, source: string | null): Error;
/**
 * Creates an initial RuntimeError instance when a problem is detected.
 * Monkey-patches extra info in the RuntimeError instance, so that it can
 * be reused later, before throwing the final error.
 */
export declare function createRuntimeError(message: string, code: number, path?: string[]): Error;
/**
 * Reads monkey-patched error code from the given Error instance.
 */
export declare function getRuntimeErrorCode(error: any): number | undefined;
