/**
 *
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../../../../src/output/output_ast';
import { ConstantPool } from '../../../constant_pool';
import { CompilationJob, CompilationJobKind as Kind, type ComponentCompilationJob, type HostBindingCompilationJob } from './compilation';
/**
 * Run all transformation phases in the correct order against a compilation job. After this
 * processing, the compilation should be in a state where it can be emitted.
 */
export declare function transform(job: CompilationJob, kind: Kind): void;
/**
 * Compile all views in the given `ComponentCompilation` into the final template function, which may
 * reference constants defined in a `ConstantPool`.
 */
export declare function emitTemplateFn(tpl: ComponentCompilationJob, pool: ConstantPool): o.FunctionExpr;
export declare function emitHostBindingFunction(job: HostBindingCompilationJob): o.FunctionExpr | null;
