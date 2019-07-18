/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {ErrorCode, makeDiagnostic} from '../../../src/ngtsc/diagnostics';
import {Reference} from '../../../src/ngtsc/imports';
import {ClassDeclaration, Decorator, isNamedClassDeclaration, isNamedFunctionDeclaration, isNamedVariableDeclaration} from '../../../src/ngtsc/reflection';
import {isRelativePath} from '../utils';
import {Migration, MigrationHost} from './migration';

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
 * to generate an `ngDirectiveDef` for `DerivedDir`. In particular, it needs to generate a factory
 * function that creates instances of `DerivedDir`.
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
    const baseClassId = host.reflectionHost.getBaseClassIdentifier(clazz);
    if (baseClassId === null) {
      return null;
    }

    const baseClazz = host.reflectionHost.getDeclarationOfIdentifier(baseClassId) !.node;

    if (!isNamedClassDeclaration(baseClazz) && !isNamedFunctionDeclaration(baseClazz) &&
        !isNamedVariableDeclaration(baseClazz)) {
      return null;
    }

    // Only interested in this base class if it doesn't have a `Directive` or `Component` decorator.
    if (hasDirectiveDecorator(host, baseClazz)) {
      return null;
    }

    const importInfo = host.reflectionHost.getImportOfIdentifier(baseClassId);
    if (importInfo !== null && !isRelativePath(importInfo.from)) {
      return makeDiagnostic(
          ErrorCode.NGCC_MIGRATION_EXTERNAL_BASE_CLASS, baseClassId,
          'The base class was imported from an external entry-point so we cannot add a directive to it.');
    }

    host.injectSyntheticDecorator(baseClazz, createDirectiveDecorator(baseClazz));

    return null;
  }
}

function hasDirectiveDecorator(host: MigrationHost, clazz: ClassDeclaration): boolean {
  return host.metadata.getDirectiveMetadata(new Reference(clazz)) !== null;
}

function hasConstructor(host: MigrationHost, clazz: ClassDeclaration): boolean {
  return host.reflectionHost.getConstructorParameters(clazz) !== null;
}

function createDirectiveDecorator(clazz: ClassDeclaration): Decorator {
  const selectorArg = ts.createObjectLiteral([
    // TODO: At the moment ngtsc does not accept a directive with no selector
    ts.createPropertyAssignment('selector', ts.createStringLiteral('NGCC_DUMMY')),
  ]);
  const decoratorType = ts.createIdentifier('Directive');
  const decoratorNode = ts.createObjectLiteral([
    ts.createPropertyAssignment('type', decoratorType),
    ts.createPropertyAssignment('args', ts.createArrayLiteral([selectorArg])),
  ]);

  setParentPointers(clazz.getSourceFile(), decoratorNode);

  return {
    name: 'Directive',
    identifier: decoratorType,
    import: {name: 'Directive', from: '@angular/core'},
    node: decoratorNode,
    args: [selectorArg],
  };
}

/**
 * Ensure that a tree of AST nodes have their parents wired up.
 */
function setParentPointers(parent: ts.Node, child: ts.Node): void {
  child.parent = parent;
  ts.forEachChild(child, grandchild => setParentPointers(child, grandchild));
}
