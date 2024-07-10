/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassDeclaration} from '../../../reflection';

/**
 * Registry that keeps track of Angular declarations that are explicitly
 * marked for JIT compilation and are skipping compilation by trait handlers.
 */
export class JitDeclarationRegistry {
  jitDeclarations = new Set<ClassDeclaration>();
}
