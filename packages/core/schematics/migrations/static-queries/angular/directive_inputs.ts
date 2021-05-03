/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {getAngularDecorators} from '../../../utils/ng_decorators';
import {getPropertyNameText, hasPropertyNameText} from '../../../utils/typescript/property_name';

/** Analyzes the given class and resolves the name of all inputs which are declared. */
export function getInputNamesOfClass(
    node: ts.ClassDeclaration, typeChecker: ts.TypeChecker): string[] {
  const resolvedInputSetters: string[] = [];

  // Determines the names of all inputs defined in the current class declaration by
  // checking whether a given property/getter/setter has the "@Input" decorator applied.
  node.members.forEach(m => {
    if (!m.decorators || !m.decorators.length ||
        !ts.isPropertyDeclaration(m) && !ts.isSetAccessor(m) && !ts.isGetAccessor(m)) {
      return;
    }

    const inputDecorator =
        getAngularDecorators(typeChecker, m.decorators!).find(d => d.name === 'Input');

    if (inputDecorator && hasPropertyNameText(m.name)) {
      resolvedInputSetters.push(m.name.text);
    }
  });

  // Besides looking for immediate setters in the current class declaration, developers
  // can also define inputs in the directive metadata using the "inputs" property. We
  // also need to determine these inputs which are declared in the directive metadata.
  const metadataInputs = getInputNamesFromMetadata(node, typeChecker);

  if (metadataInputs) {
    resolvedInputSetters.push(...metadataInputs);
  }

  return resolvedInputSetters;
}

/**
 * Determines the names of all inputs declared in the directive/component metadata
 * of the given class.
 */
function getInputNamesFromMetadata(
    node: ts.ClassDeclaration, typeChecker: ts.TypeChecker): string[]|null {
  if (!node.decorators || !node.decorators.length) {
    return null;
  }

  const decorator = getAngularDecorators(typeChecker, node.decorators)
                        .find(d => d.name === 'Directive' || d.name === 'Component');

  // In case no directive/component decorator could be found for this class, just
  // return null as there is no metadata where an input could be declared.
  if (!decorator) {
    return null;
  }

  const decoratorCall = decorator.node.expression;

  // In case the decorator does define any metadata, there is no metadata
  // where inputs could be declared. This is an edge case because there
  // always needs to be an object literal, but in case there isn't we just
  // want to skip the invalid decorator and return null.
  if (decoratorCall.arguments.length !== 1 ||
      !ts.isObjectLiteralExpression(decoratorCall.arguments[0])) {
    return null;
  }

  const metadata = decoratorCall.arguments[0] as ts.ObjectLiteralExpression;
  const inputs = metadata.properties.filter(ts.isPropertyAssignment)
                     .find(p => getPropertyNameText(p.name) === 'inputs');

  // In case there is no "inputs" property in the directive metadata,
  // just return "null" as no inputs can be declared for this class.
  if (!inputs || !ts.isArrayLiteralExpression(inputs.initializer)) {
    return null;
  }

  return inputs.initializer.elements.filter(ts.isStringLiteralLike)
      .map(element => element.text.split(':')[0].trim());
}
