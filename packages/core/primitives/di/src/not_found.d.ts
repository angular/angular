/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Value returned if the key-value pair couldn't be found in the context
 * hierarchy.
 */
export declare const NOT_FOUND: unique symbol;
/**
 * Error thrown when the key-value pair couldn't be found in the context
 * hierarchy. Context can be attached below.
 */
export declare class NotFoundError extends Error {
    readonly name: string;
    constructor(message: string);
}
/**
 * Type guard for checking if an unknown value is a NotFound.
 */
export declare function isNotFound(e: unknown): e is NotFound;
/**
 * Type union of NotFound and NotFoundError.
 */
export type NotFound = typeof NOT_FOUND | NotFoundError;
