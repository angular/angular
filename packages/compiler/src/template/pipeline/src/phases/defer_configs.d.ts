/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { ComponentCompilationJob } from '../compilation';
/**
 * Defer instructions take a configuration array, which should be collected into the component
 * consts. This phase finds the config options, and creates the corresponding const array.
 */
export declare function configureDeferInstructions(job: ComponentCompilationJob): void;
