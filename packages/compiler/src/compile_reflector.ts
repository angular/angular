/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from './output/output_ast';

/**
 * Provides access to reflection data about symbols that the compiler needs.
 */
export abstract class CompileReflector {
  abstract resolveExternalReference(ref: o.ExternalReference): any;
}
