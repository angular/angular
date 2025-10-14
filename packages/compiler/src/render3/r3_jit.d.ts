/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../output/output_ast';
import { ExternalReferenceResolver } from '../output/output_jit';
/**
 * Implementation of `CompileReflector` which resolves references to @angular/core
 * symbols at runtime, according to a consumer-provided mapping.
 *
 * Only supports `resolveExternalReference`, all other methods throw.
 */
export declare class R3JitReflector implements ExternalReferenceResolver {
    private context;
    constructor(context: {
        [key: string]: unknown;
    });
    resolveExternalReference(ref: o.ExternalReference): unknown;
}
