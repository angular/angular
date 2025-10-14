/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { CompilationJob } from '../compilation';
/**
 * Host bindings are compiled using a different parser entrypoint, and are parsed quite differently
 * as a result. Therefore, we need to do some extra parsing for host style properties, as compared
 * to non-host style properties.
 * TODO: Unify host bindings and non-host bindings in the parser.
 */
export declare function parseHostStyleProperties(job: CompilationJob): void;
