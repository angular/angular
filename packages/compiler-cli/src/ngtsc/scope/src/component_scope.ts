/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ClassDeclaration} from '../../reflection';
import {RemoteScope} from './api';
import {LocalModuleScope} from './local';

/**
 * Read information about the compilation scope of components.
 */
export interface ComponentScopeReader {
  getScopeForComponent(clazz: ClassDeclaration): LocalModuleScope|null;

  /**
   * Get the `RemoteScope` required for this component, if any.
   *
   * If the component requires remote scoping, then retrieve the directives/pipes registered for
   * that component. If remote scoping is not required (the common case), returns `null`.
   */
  getRemoteScope(clazz: ClassDeclaration): RemoteScope|null;
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

  getScopeForComponent(clazz: ClassDeclaration): LocalModuleScope|null {
    for (const reader of this.readers) {
      const meta = reader.getScopeForComponent(clazz);
      if (meta !== null) {
        return meta;
      }
    }
    return null;
  }

  getRemoteScope(clazz: ClassDeclaration): RemoteScope|null {
    for (const reader of this.readers) {
      const remoteScope = reader.getRemoteScope(clazz);
      if (remoteScope !== null) {
        return remoteScope;
      }
    }
    return null;
  }
}
