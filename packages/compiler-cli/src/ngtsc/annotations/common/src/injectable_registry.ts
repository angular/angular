/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {R3DependencyMetadata} from '@angular/compiler';

import {hasInjectableFields} from '../../../metadata';
import {ClassDeclaration, ReflectionHost} from '../../../reflection';

import {getConstructorDependencies, unwrapConstructorDependencies} from './di';


export interface InjectableMeta {
  ctorDeps: R3DependencyMetadata[]|'invalid'|null;
}

/**
 * Registry that keeps track of classes that can be constructed via dependency injection (e.g.
 * injectables, directives, pipes).
 */
export class InjectableClassRegistry {
  private classes = new Map<ClassDeclaration, InjectableMeta>();

  constructor(private host: ReflectionHost, private isCore: boolean) {}

  registerInjectable(declaration: ClassDeclaration, meta: InjectableMeta): void {
    this.classes.set(declaration, meta);
  }

  getInjectableMeta(declaration: ClassDeclaration): InjectableMeta|null {
    // Figure out whether the class is injectable based on the registered classes, otherwise
    // fall back to looking at its members since we might not have been able to register the class
    // if it was compiled in another compilation unit.
    if (this.classes.has(declaration)) {
      return this.classes.get(declaration)!;
    }

    if (!hasInjectableFields(declaration, this.host)) {
      return null;
    }

    const ctorDeps = getConstructorDependencies(declaration, this.host, this.isCore);
    const meta: InjectableMeta = {
      ctorDeps: unwrapConstructorDependencies(ctorDeps),
    };
    this.classes.set(declaration, meta);
    return meta;
  }
}
