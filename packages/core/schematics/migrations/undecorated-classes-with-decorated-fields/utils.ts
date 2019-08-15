/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {getAngularDecorators} from '../../utils/ng_decorators';

/** Name of the decorator that should be added to undecorated classes. */
export const FALLBACK_DECORATOR = 'Directive';

/** Finds all of the undercorated classes that have decorated fields within a file. */
export function getUndecoratedClassesWithDecoratedFields(
    sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker) {
  const classes: UndecoratedClassWithDecoratedFields[] = [];

  sourceFile.forEachChild(function walk(node: ts.Node) {
    if (ts.isClassDeclaration(node) &&
        (!node.decorators || !getAngularDecorators(typeChecker, node.decorators).length)) {
      for (const member of node.members) {
        const angularDecorators =
            member.decorators && getAngularDecorators(typeChecker, member.decorators);

        if (angularDecorators && angularDecorators.length) {
          classes.push(
              {classDeclaration: node, importDeclaration: angularDecorators[0].importNode});
          return;
        }
      }
    }

    node.forEachChild(walk);
  });

  return classes;
}

/** Checks whether an import declaration has an import with a certain name. */
export function hasNamedImport(declaration: ts.ImportDeclaration, symbolName: string): boolean {
  const namedImports = getNamedImports(declaration);

  if (namedImports) {
    return namedImports.elements.some(element => {
      const {name, propertyName} = element;
      return propertyName ? propertyName.text === symbolName : name.text === symbolName;
    });
  }

  return false;
}

/** Extracts the NamedImports node from an import declaration. */
export function getNamedImports(declaration: ts.ImportDeclaration): ts.NamedImports|null {
  const namedBindings = declaration.importClause && declaration.importClause.namedBindings;
  return (namedBindings && ts.isNamedImports(namedBindings)) ? namedBindings : null;
}

/** Adds a new import to a NamedImports node. */
export function addImport(declaration: ts.NamedImports, symbolName: string) {
  return ts.updateNamedImports(declaration, [
    ...declaration.elements, ts.createImportSpecifier(undefined, ts.createIdentifier(symbolName))
  ]);
}

interface UndecoratedClassWithDecoratedFields {
  classDeclaration: ts.ClassDeclaration;
  importDeclaration: ts.ImportDeclaration;
}
