/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {GrammarDefinition} from './types';

export const TemplateIcu: GrammarDefinition = {
  scopeName: 'template.icu.ng',
  injectionSelector: 'L:text.html -comment -expression.ng -meta.tag -source.css -source.js',
  patterns: [{include: '#icu'}],
  repository: {
    icu: {
      // An ICU expression starts with a single `{`, followed by the expression to switch on and
      // the ICU type. The whole header is required in order to not highlight arbitrary braces.
      begin: /(\{)\s*([^{},]+?)\s*(,)\s*(plural|select)\s*(,)/,
      beginCaptures: {
        1: {name: 'punctuation.definition.block.ts'},
        2: {name: 'expression.ng', patterns: [{include: 'expression.ng'}]},
        3: {name: 'punctuation.separator.comma.ts'},
        4: {name: 'keyword.control.icu.kind.ng'},
        5: {name: 'punctuation.separator.comma.ts'},
      },
      end: /\}/,
      endCaptures: {
        0: {name: 'punctuation.definition.block.ts'},
      },
      name: 'meta.icu.ng',
      patterns: [{include: '#icuCase'}],
    },

    icuCase: {
      // The case value is part of the match so that the case starts before its opening brace.
      // Otherwise the interpolation injection would take precedence when the case body starts with
      // an interpolation, e.g. `one {{{count}} item}`, and consume the opening brace of the case.
      begin: /(?:([^\s{}][^{}]*?)\s*)?(\{)/,
      beginCaptures: {
        1: {name: 'keyword.control.icu.case.ng'},
        2: {name: 'punctuation.definition.block.ts'},
      },
      end: /\}/,
      endCaptures: {
        0: {name: 'punctuation.definition.block.ts'},
      },
      contentName: 'meta.icu.case.body.ng',
      patterns: [{include: '#icu'}, {include: 'text.html.derivative'}, {include: 'template.ng'}],
    },
  },
};
