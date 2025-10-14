/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { CompilationJob } from '../compilation';
/**
 * Deduplicate text bindings, e.g. <div class="cls1" class="cls2">
 */
export declare function deduplicateTextBindings(job: CompilationJob): void;
