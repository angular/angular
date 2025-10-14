/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare class InterpolationConfig {
    start: string;
    end: string;
    static fromArray(markers: [string, string] | null): InterpolationConfig;
    constructor(start: string, end: string);
}
export declare const DEFAULT_INTERPOLATION_CONFIG: InterpolationConfig;
export declare const DEFAULT_CONTAINER_BLOCKS: Set<string>;
