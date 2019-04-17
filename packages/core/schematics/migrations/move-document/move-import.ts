/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

export function removeFromImport(importNode: ts.NamedImports, ...keys: string[]): string {
  const elements = importNode.elements;
  const getName = (el: ts.ImportSpecifier) => el.propertyName ?
      `${el.propertyName.escapedText} as ${el.name.escapedText}` :
      String(el.name.escapedText);
  const elementsMap = elements.map(getName).filter(el => keys.indexOf(el) === -1);
  const importDeclaration = importNode.parent.parent;
  return elementsMap.length > 0 ?
      `import { ${elementsMap.join(', ')} } from ${importDeclaration.moduleSpecifier.getText()};` :
      '';
}

export function addToImport(importNode: ts.NamedImports, ...keys: string[]): string {
  const elements = importNode.elements;
  const getName = (el: ts.ImportSpecifier) => el.propertyName ?
      `${el.propertyName.escapedText} as ${el.name.escapedText}` :
      el.name.escapedText + '';
  const elementsMap = elements.map(getName);
  elementsMap.push(...keys);
  const importDeclaration = importNode.parent.parent;
  return `import { ${elementsMap.join(', ')} } from ${importDeclaration.moduleSpecifier.getText()};`;
}
