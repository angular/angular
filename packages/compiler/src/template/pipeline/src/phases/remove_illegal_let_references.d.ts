/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { CompilationJob } from '../compilation';
/**
 * It's not allowed to access a `@let` declaration before it has been defined. This is enforced
 * already via template type checking, however it can trip some of the assertions in the pipeline.
 * E.g. the naming phase can fail because we resolved the variable here, but the variable doesn't
 * exist anymore because the optimization phase removed it since it's invalid. To avoid surfacing
 * confusing errors to users in the case where template type checking isn't running (e.g. in JIT
 * mode) this phase detects illegal forward references and replaces them with `undefined`.
 * Eventually users will see the proper error from the template type checker.
 */
export declare function removeIllegalLetReferences(job: CompilationJob): void;
