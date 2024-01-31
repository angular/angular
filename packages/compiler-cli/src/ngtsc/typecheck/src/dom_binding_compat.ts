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
  // Id is occasionally receiving numbers that are coerced.
  'id': {additionalType: numberType},
  // Hidden is often a string. TODO?
  'hidden': {additionalType: stringType},
};

export const domBindingCompatMappings = new Map<string, Record<string, DomMapping>>([
  [
    'button', {
      'type': {additionalType: stringType},  // Union not preferred.
    }
  ],
  [
    'iframe', {
      'width': {additionalType: numberType},   // Number is coerced to string.
      'height': {additionalType: numberType},  // Number is coerced to string.
    }
  ],
  [
    'input',
    {
      'value': {additionalType: numberType},         // Number is coerced to string.
      'autocomplete': {additionalType: stringType},  // Union not preferred.
      'step': {additionalType: numberType},          // Number is coerced to string.
      'min': {additionalType: numberType},           // Number is coerced to string.
      'max': {additionalType: numberType},           // Number is coerced to string.
    },
  ],
  [
    'img', {
      'width': {additionalType: stringType},   // String is coerced.
      'height': {additionalType: stringType},  // String is coerced.
    }
  ],
  [
    'col', {
      'width': {additionalType: numberType},   // Number is coerced to string.
      'height': {additionalType: numberType},  // Number is coerced to string.
    }
  ]
]);
