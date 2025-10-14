/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare class Log<T = string> {
    logItems: T[];
    constructor();
    add(value: T): void;
    fn(value: T): () => void;
    clear(): void;
    result(): string;
}
