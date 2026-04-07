/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {GrammarDefinition} from './types';

export const LetDeclaration: GrammarDefinition = {
  scopeName: 'template.let.ng',
  injectionSelector: 'L:text.html -comment -expression.ng -meta.tag -source.css -source.js',
  patterns: [{include: '#letDeclaration'}],
  repository: {
    letDeclaration: {
      name: 'meta.definition.variable.ng',
      // Equals group is optional so that we start highlighting as
      // soon as the user starts writing a valid name.
      begin: /(@let)\s+([_$[:alpha:]][_$[:alnum:]]*)\s*(=)?/,
      beginCaptures: {
        1: {name: 'storage.type.ng'},
        2: {name: 'variable.other.constant.ng'},
        3: {name: 'keyword.operator.assignment.ng'},
      },
      patterns: [{include: '#letInitializer'}],
      end: /(?<=;)/,
    },

    letInitializer: {
      begin: /\s*/,
      beginCaptures: {
        0: {name: 'keyword.operator.assignment.ng'},
      },
      contentName: 'meta.definition.variable.initializer.ng',
      patterns: [{include: 'expression.ng'}],
      end: /;/,
      endCaptures: {
        0: {name: 'punctuation.terminator.statement.ng'},
      },
    },
  },
};
