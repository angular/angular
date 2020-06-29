/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {getAngularDecorators} from '../../utils/ng_decorators';

/**
 * Identifies the nodes that should be migrated by the dynamic
 * queries schematic. Splits the nodes into the following categories:
 * - `removeProperty` - queries from which we should only remove the `static` property of the
 *  `options` parameter (e.g. `@ViewChild('child', {static: false, read: ElementRef})`).
 * - `removeParameter` - queries from which we should drop the entire `options` parameter.
 *  (e.g. `@ViewChild('child', {static: false})`).
 */
export function identifyDynamicQueryNodes(typeChecker: ts.TypeChecker, sourceFile: ts.SourceFile) {
  const removeProperty: ts.ObjectLiteralExpression[] = [];
  const removeParameter: ts.CallExpression[] = [];

  sourceFile.forEachChild(function walk(node: ts.Node) {
    if (ts.isClassDeclaration(node)) {
      node.members.forEach(member => {
        const angularDecorators =
            member.decorators && getAngularDecorators(typeChecker, member.decorators);

        if (angularDecorators) {
          angularDecorators
              // Filter out the queries that can have the `static` flag.
              .filter(decorator => {
                return decorator.name === 'ViewChild' || decorator.name === 'ContentChild';
              })
              // Filter out the queries where the `static` flag is explicitly set to `false`.
              .filter(decorator => {
                const options = decorator.node.expression.arguments[1];
                return options && ts.isObjectLiteralExpression(options) &&
                    options.properties.some(
                        property => ts.isPropertyAssignment(property) &&
                            property.initializer.kind === ts.SyntaxKind.FalseKeyword);
              })
              .forEach(decorator => {
                const options =
                    decorator.node.expression.arguments[1] as ts.ObjectLiteralExpression;

                // At this point we know that at least one property is the `static` flag. If this is
                // the only property we can drop the entire object literal, otherwise we have to
                // drop only the property.
                if (options.properties.length === 1) {
                  removeParameter.push(decorator.node.expression);
                } else {
                  removeProperty.push(options);
                }
              });
        }
      });
    }

    node.forEachChild(walk);
  });

  return {removeProperty, removeParameter};
}

/** Removes the `options` parameter from the call expression of a query decorator. */
export function removeOptionsParameter(node: ts.CallExpression): ts.CallExpression {
  return ts.updateCall(node, node.expression, node.typeArguments, [node.arguments[0]]);
}

/** Removes the `static` property from an object literal expression. */
export function removeStaticFlag(node: ts.ObjectLiteralExpression): ts.ObjectLiteralExpression {
  return ts.updateObjectLiteral(
      node,
      node.properties.filter(property => property.name && property.name.getText() !== 'static'));
}
