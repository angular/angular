/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../output/output_ast';
import {ExternalReferenceResolver} from '../output/output_jit';

/**
 * Implementation of `CompileReflector` which resolves references to @angular/core
 * symbols at runtime, according to a consumer-provided mapping.
 *
 * Only supports `resolveExternalReference`, all other methods throw.
 */
export class R3JitReflector implements ExternalReferenceResolver {
  constructor(private context: {[key: string]: unknown}) {}

  resolveExternalReference(ref: o.ExternalReference): unknown {
    // This reflector only handles @angular/core imports.
    if (ref.moduleName !== '@angular/core') {
      throw new Error(`Cannot resolve external reference to ${
          ref.moduleName}, only references to @angular/core are supported.`);
    }
    if (!this.context.hasOwnProperty(ref.name!)) {
      throw new Error(`No value provided for @angular/core symbol '${ref.name!}'.`);
    }
    return this.context[ref.name!];
  }
}
