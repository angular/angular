/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ClassDeclaration} from '../../reflection';
import {LocalModuleScope} from './local';

/**
 * Register information about the compilation scope of components.
 */
export interface ComponentScopeRegistry {
  registerComponentScope(clazz: ClassDeclaration, scope: LocalModuleScope): void;
  setComponentAsRequiringRemoteScoping(clazz: ClassDeclaration): void;
}

/**
 * Read information about the compilation scope of components.
 */
export interface ComponentScopeReader {
  getScopeForComponent(clazz: ClassDeclaration): LocalModuleScope|null;
  getRequiresRemoteScope(clazz: ClassDeclaration): boolean|null;
}

/**
 * A noop registry that doesn't do anything.
 *
 * This can be used in tests and cases where we don't care about the compilation scopes
 * being registered.
 */
export class NoopComponentScopeRegistry implements ComponentScopeRegistry {
  registerComponentScope(clazz: ClassDeclaration, scope: LocalModuleScope): void {}
  setComponentAsRequiringRemoteScoping(clazz: ClassDeclaration): void {}
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
