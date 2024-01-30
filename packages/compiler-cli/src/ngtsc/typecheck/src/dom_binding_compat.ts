/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

const stringType = () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
const numberType = () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
const booleanType = () => ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);

interface DomMapping {
  additionalType: () => ts.TypeNode;
}

export const domAllElementMappings: Record<string, DomMapping> = {
  'ariaChecked': {additionalType: booleanType},
  'ariaDisabled': {additionalType: booleanType},
  'ariaExpanded': {additionalType: booleanType},
  // Tabindex is coerced into a number, we see many cases where a string value is passed.
  'tabIndex': {additionalType: stringType},
};

export const domBindingCompatMappings = new Map<string, Record<string, DomMapping>>([
  [
    'button', {
      'type': {additionalType: stringType},  // Union not preferred.
    }
  ],
  [
    'iframe', {
      'width': {additionalType: numberType},
      'height': {additionalType: numberType},
    }
  ],
  [
    'input',
    {
      'value': {additionalType: numberType},
      'autocomplete': {additionalType: stringType},  // Union not preferred.
      'step': {additionalType: numberType},
    },
  ]
]);
