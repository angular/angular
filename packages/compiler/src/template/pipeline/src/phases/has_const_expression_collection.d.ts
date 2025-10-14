/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { ComponentCompilationJob } from '../compilation';
/**
 * `ir.ConstCollectedExpr` may be present in any IR expression. This means that expression needs to
 * be lifted into the component const array, and replaced with a reference to the const array at its
 *
 * usage site. This phase walks the IR and performs this transformation.
 */
export declare function collectConstExpressions(job: ComponentCompilationJob): void;
