/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DirectiveForestHooks } from './hooks';
export declare const enableTimingAPI: () => boolean;
export declare const disableTimingAPI: () => boolean;
export declare const initializeOrGetDirectiveForestHooks: (depsForTestOnly?: {
    directiveForestHooks?: typeof DirectiveForestHooks;
}) => DirectiveForestHooks;
