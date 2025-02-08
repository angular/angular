/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ChangeTracker} from '../../utils/change_tracker';
import {getImportSpecifier, getNamedImports} from '../../utils/typescript/imports';

const CORE = '@angular/core';
const DIRECTIVE = 'Directive';
const COMPONENT = 'Component';
const PIPE = 'Pipe';

type RewriteFn = (startPos: number, width: number, text: string) => void;

export function migrateFile(sourceFile: ts.SourceFile, rewriteFn: RewriteFn) {
  const changeTracker = new ChangeTracker(ts.createPrinter());

  // Check if there are any imports of the `AfterRenderPhase` enum.
  const coreImports = getNamedImports(sourceFile, CORE);
  if (!coreImports) {
    return;
  }
  const directive = getImportSpecifier(sourceFile, CORE, DIRECTIVE);
  const component = getImportSpecifier(sourceFile, CORE, COMPONENT);
  const pipe = getImportSpecifier(sourceFile, CORE, PIPE);

  if (!directive && !component && !pipe) {
    return;
  }

  ts.forEachChild(sourceFile, function visit(node: ts.Node) {
    ts.forEachChild(node, visit);

    // First we need to check for class declarations
    // Decorators will come after
    if (!ts.isClassDeclaration(node)) {
      return;
    }

    ts.getDecorators(node)?.forEach((decorator) => {
      if (!ts.isDecorator(decorator)) {
        return;
      }

      const callExpression = decorator.expression;
      if (!ts.isCallExpression(callExpression)) {
        return;
      }

      const decoratorIdentifier = callExpression.expression;
      if (!ts.isIdentifier(decoratorIdentifier)) {
        return;
      }

      // Checking the identifier of the decorator by comparing to the import specifier
      switch (decoratorIdentifier.text) {
        case directive?.name.text:
        case component?.name.text:
        case pipe?.name.text:
          break;
        default:
          // It's not a decorator to migrate
          return;
      }

      const [decoratorArgument] = callExpression.arguments;
      if (!decoratorArgument || !ts.isObjectLiteralExpression(decoratorArgument)) {
        return;
      }
      const properties = decoratorArgument.properties;
      const standaloneProp = getStandaloneProperty(properties);
      const hasImports = decoratorHasImports(decoratorArgument);

      // We'll use the presence of imports to keep the migration idempotent
      // We need to take care of 3 cases
      // - standalone: true  => remove the property if we have imports
      // - standalone: false => nothing
      // - No standalone property => add a standalone: false property if there are no imports

      let newProperties: undefined | ts.ObjectLiteralElementLike[];

      if (!standaloneProp) {
        if (!hasImports) {
          const standaloneFalseProperty = ts.factory.createPropertyAssignment(
            'standalone',
            ts.factory.createFalse(),
          );

          newProperties = [...properties, standaloneFalseProperty];
        }
      } else if (standaloneProp.value === ts.SyntaxKind.TrueKeyword && hasImports) {
        // To keep the migration idempotent, we'll only remove the standalone prop when there are imports
        newProperties = properties.filter((p) => p !== standaloneProp.property);
      }

      if (newProperties) {
        // At this point we know that we need to add standalone: false or
        // remove an existing standalone: true property.
        const newPropsArr = ts.factory.createNodeArray(newProperties);
        const newFirstArg = ts.factory.createObjectLiteralExpression(newPropsArr, true);
        changeTracker.replaceNode(decoratorArgument, newFirstArg);
      }
    });
  });

  // Write the changes.
  for (const changesInFile of changeTracker.recordChanges().values()) {
    for (const change of changesInFile) {
      rewriteFn(change.start, change.removeLength ?? 0, change.text);
    }
  }
}

function getStandaloneProperty(properties: ts.NodeArray<ts.ObjectLiteralElementLike>) {
  for (const prop of properties) {
    if (ts.isShorthandPropertyAssignment(prop) && prop.name.text) {
      return {property: prop, value: prop.objectAssignmentInitializer};
    }

    if (isStandaloneProperty(prop)) {
      if (
        prop.initializer.kind === ts.SyntaxKind.TrueKeyword ||
        prop.initializer.kind === ts.SyntaxKind.FalseKeyword
      ) {
        return {property: prop, value: prop.initializer.kind};
      } else {
        return {property: prop, value: prop.initializer};
      }
    }
  }
  return undefined;
}

function isStandaloneProperty(prop: ts.Node): prop is ts.PropertyAssignment {
  return (
    ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === 'standalone'
  );
}

function decoratorHasImports(decoratorArgument: ts.ObjectLiteralExpression) {
  for (const prop of decoratorArgument.properties) {
    if (
      ts.isPropertyAssignment(prop) &&
      ts.isIdentifier(prop.name) &&
      prop.name.text === 'imports'
    ) {
      if (
        prop.initializer.kind === ts.SyntaxKind.ArrayLiteralExpression ||
        prop.initializer.kind === ts.SyntaxKind.Identifier
      ) {
        return true;
      }
    }
  }
  return false;
}
