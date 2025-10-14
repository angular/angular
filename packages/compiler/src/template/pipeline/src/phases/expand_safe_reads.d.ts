/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { CompilationJob } from '../compilation';
/**
 * Safe read expressions such as `a?.b` have different semantics in Angular templates as
 * compared to JavaScript. In particular, they default to `null` instead of `undefined`. This phase
 * finds all unresolved safe read expressions, and converts them into the appropriate output AST
 * reads, guarded by null checks. We generate temporaries as needed, to avoid re-evaluating the same
 * sub-expression multiple times.
 */
export declare function expandSafeReads(job: CompilationJob): void;
