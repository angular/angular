/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ChangeTracker, PendingChange} from '../../utils/change_tracker';
import {getAngularDecorators} from '../../utils/ng_decorators';
import {findBaseClassDeclarations} from '../../utils/typescript/find_base_classes';

export function migrateFile(
  sourceFile: ts.SourceFile,
  typeChecker: ts.TypeChecker,
): PendingChange[] {
  const tracker = new ChangeTracker(ts.createPrinter());
  let totalInjectables = 0;
  let migratedInjectables = 0;

  ts.forEachChild(sourceFile, function visit(node: ts.Node) {
    if (ts.isClassDeclaration(node)) {
      const decorator = getAngularDecorators(typeChecker, ts.getDecorators(node) || []).find(
        (d) => d.name === 'Injectable' && d.moduleName === '@angular/core',
      );

      if (decorator) {
        const analysis = analyzeClass(node, decorator.node.expression.arguments, typeChecker);
        totalInjectables++;

        if (analysis.canMigrate) {
          migratedInjectables++;
          tracker.addImport(sourceFile, 'Service', '@angular/core');
          tracker.replaceText(
            sourceFile,
            decorator.node.getStart(),
            decorator.node.getWidth(),
            `@Service(${analysis.providedInRoot ? '' : '{ autoProvided: false }'})`,
          );
        }
      }
    }
    ts.forEachChild(node, visit);
  });

  if (totalInjectables > 0 && totalInjectables === migratedInjectables) {
    tracker.removeImport(sourceFile, 'Injectable', '@angular/core');
  }

  return tracker.recordChanges().get(sourceFile) || [];
}

function analyzeClass(
  node: ts.ClassDeclaration,
  decoratorArgs: readonly ts.Expression[],
  typeChecker: ts.TypeChecker,
) {
  const analysis = {
    canMigrate: false,
    providedInRoot: false,
  };

  // We can't migrate if the class is using constructor DI.
  if (usesConstructorDI(node, typeChecker)) {
    return analysis;
  } else if (decoratorArgs.length === 0) {
    analysis.canMigrate = true;
    return analysis;
  } else if (decoratorArgs.length !== 1 || !ts.isObjectLiteralExpression(decoratorArgs[0])) {
    return analysis;
  }

  for (const prop of decoratorArgs[0].properties) {
    // We can't migrate if there's any other property than `providedIn`.
    if (
      !ts.isPropertyAssignment(prop) ||
      (!ts.isIdentifier(prop.name) && !ts.isStringLiteralLike(prop.name)) ||
      prop.name.text !== 'providedIn'
    ) {
      analysis.canMigrate = false;
      return analysis;
    }

    // We can only migrate if `providedIn` is set to `root`.
    if (ts.isStringLiteralLike(prop.initializer) && prop.initializer.text === 'root') {
      analysis.providedInRoot = true;
    } else {
      // Otherwise we can't migrate it either.
      analysis.canMigrate = false;
      return analysis;
    }
  }

  // If we made it this, it's possible to migrate.
  analysis.canMigrate = true;
  return analysis;
}

/** Determines whether a class uses constructor-based dependency injection. */
function usesConstructorDI(node: ts.ClassDeclaration, typeChecker: ts.TypeChecker): boolean {
  const baseClasses = [node, ...findBaseClassDeclarations(node, typeChecker).map((c) => c.node)];

  for (const current of baseClasses) {
    const constructorNode = current.members.find(
      (member): member is ts.ConstructorDeclaration =>
        ts.isConstructorDeclaration(member) && !!member.body,
    );

    if (constructorNode) {
      return constructorNode.parameters.length > 0;
    }
  }

  return false;
}
