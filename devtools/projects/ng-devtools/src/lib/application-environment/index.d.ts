/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export interface Environment {
    production: boolean;
}
export declare const TOP_LEVEL_FRAME_ID = 0;
export interface Frame {
    id: number;
    name: string;
    url: URL;
}
export declare abstract class ApplicationEnvironment {
    abstract get environment(): Environment;
    abstract frameSelectorEnabled: boolean;
}
