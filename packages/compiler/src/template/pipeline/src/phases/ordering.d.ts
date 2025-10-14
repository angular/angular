/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { type CompilationJob } from '../compilation';
/**
 * Many type of operations have ordering constraints that must be respected. For example, a
 * `ClassMap` instruction must be ordered after a `StyleMap` instruction, in order to have
 * predictable semantics that match TemplateDefinitionBuilder and don't break applications.
 */
export declare function orderOps(job: CompilationJob): void;
