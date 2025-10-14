/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ViewEncapsulation } from './core';
export declare class CompilerConfig {
    defaultEncapsulation: ViewEncapsulation | null;
    preserveWhitespaces: boolean;
    strictInjectionParameters: boolean;
    constructor({ defaultEncapsulation, preserveWhitespaces, strictInjectionParameters, }?: {
        defaultEncapsulation?: ViewEncapsulation;
        preserveWhitespaces?: boolean;
        strictInjectionParameters?: boolean;
    });
}
export declare function preserveWhitespacesDefault(preserveWhitespacesOption: boolean | null, defaultSetting?: boolean): boolean;
