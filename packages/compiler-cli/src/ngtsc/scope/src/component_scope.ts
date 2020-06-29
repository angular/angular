/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ClassDeclaration} from '../../reflection';
import {LocalModuleScope} from './local';

/**
 * Read information about the compilation scope of components.
 */
export interface ComponentScopeReader {
  getScopeForComponent(clazz: ClassDeclaration): LocalModuleScope|null|'error';
  getRequiresRemoteScope(clazz: ClassDeclaration): boolean|null;
}

/**
 * A `ComponentScopeReader` that reads from an ordered set of child readers until it obtains the
 * requested scope.
 *
 * This is used to combine `ComponentScopeReader`s that read from different sources (e.g. from a
 * registry and from the incremental state).
 */
export class CompoundComponentScopeReader implements ComponentScopeReader {
  constructor(private readers: ComponentScopeReader[]) {}

  getScopeForComponent(clazz: ClassDeclaration): LocalModuleScope|null|'error' {
    for (const reader of this.readers) {
      const meta = reader.getScopeForComponent(clazz);
      if (meta !== null) {
        return meta;
      }
    }
    return null;
  }

  getRequiresRemoteScope(clazz: ClassDeclaration): boolean|null {
    for (const reader of this.readers) {
      const requiredScoping = reader.getRequiresRemoteScope(clazz);
      if (requiredScoping !== null) {
        return requiredScoping;
      }
    }
    return null;
  }
}
