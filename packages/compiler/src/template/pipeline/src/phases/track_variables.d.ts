/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { CompilationJob } from '../compilation';
/**
 * Inside the `track` expression on a `for` repeater, the `$index` and `$item` variables are
 * ambiently available. In this phase, we find those variable usages, and replace them with the
 * appropriate output read.
 */
export declare function generateTrackVariables(job: CompilationJob): void;
