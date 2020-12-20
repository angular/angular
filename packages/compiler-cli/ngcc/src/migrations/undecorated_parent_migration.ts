/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {Reference} from '../../../src/ngtsc/imports';
import {ClassDeclaration} from '../../../src/ngtsc/reflection';

import {Migration, MigrationHost} from './migration';
import {createDirectiveDecorator, hasConstructor, hasDirectiveDecorator, isClassDeclaration} from './utils';


/**
 * Ensure that the parents of directives and components that have no constructor are also decorated
 * as a `Directive`.
 *
 * Example:
 *
 * ```
 * export class BasePlain {
 *   constructor(private vcr: ViewContainerRef) {}
 * }
 *
 * @Directive({selector: '[blah]'})
 * export class DerivedDir extends BasePlain {}
 * ```
 *
 * When compiling `DerivedDir` which extends the undecorated `BasePlain` class, the compiler needs
 * to generate a directive def (`ɵdir`) for `DerivedDir`. In particular, it needs to generate a
 * factory function that creates instances of `DerivedDir`.
 *
 * As `DerivedDir` has no constructor, the factory function for `DerivedDir` must delegate to the
 * factory function for `BasePlain`. But for this to work, `BasePlain` must have a factory function,
 * itself.
 *
 * This migration adds a `Directive` decorator to such undecorated parent classes, to ensure that
 * the compiler will create the necessary factory function.
 *
 * The resulting code looks like:
 *
 * ```
 * @Directive()
 * export class BasePlain {
 *   constructor(private vcr: ViewContainerRef) {}
 * }
 *
 * @Directive({selector: '[blah]'})
 * export class DerivedDir extends BasePlain {}
 * ```
 */
export class UndecoratedParentMigration implements Migration {
  apply(clazz: ClassDeclaration, host: MigrationHost): ts.Diagnostic|null {
    // Only interested in `clazz` if it is a `Component` or a `Directive`,
    // and it has no constructor of its own.
    if (!hasDirectiveDecorator(host, clazz) || hasConstructor(host, clazz)) {
      return null;
    }

    // Only interested in `clazz` if it inherits from a base class.
    let baseClazzRef = determineBaseClass(clazz, host);
    while (baseClazzRef !== null) {
      const baseClazz = baseClazzRef.node;

      // Do not proceed if the base class already has a decorator, or is not in scope of the
      // entry-point that is currently being compiled.
      if (hasDirectiveDecorator(host, baseClazz) || !host.isInScope(baseClazz)) {
        break;
      }

      // Inject an `@Directive()` decorator for the base class.
      host.injectSyntheticDecorator(baseClazz, createDirectiveDecorator(baseClazz));

      // If the base class has a constructor, there's no need to continue walking up the
      // inheritance chain. The injected decorator ensures that a factory is generated that does
      // not delegate to the base class.
      if (hasConstructor(host, baseClazz)) {
        break;
      }

      // Continue with another level of class inheritance.
      baseClazzRef = determineBaseClass(baseClazz, host);
    }

    return null;
  }
}

/**
 * Computes a reference to the base class, or `null` if the class has no base class or if it could
 * not be statically determined.
 */
function determineBaseClass(
    clazz: ClassDeclaration, host: MigrationHost): Reference<ClassDeclaration>|null {
  const baseClassExpr = host.reflectionHost.getBaseClassExpression(clazz);
  if (baseClassExpr === null) {
    return null;
  }

  const baseClass = host.evaluator.evaluate(baseClassExpr);
  if (!(baseClass instanceof Reference) || !isClassDeclaration(baseClass.node)) {
    return null;
  }

  return baseClass as Reference<ClassDeclaration>;
}
