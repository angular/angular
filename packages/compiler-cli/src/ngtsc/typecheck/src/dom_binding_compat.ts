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

export const domBindingCompatMappings =
    new Map<string, Record<string, {additionalType: () => ts.TypeNode}>>([
      [
        'iframe', {
          'width': {additionalType: numberType},
          'height': {additionalType: numberType},
        }
      ],
      [
        'input',
        {
          'autocomplete': {additionalType: stringType},
        },
      ]
    ]);
