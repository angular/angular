'use strict';
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, '__esModule', {value: true});
exports.Template = void 0;
exports.Template = {
  scopeName: 'template.ng',
  injectionSelector: 'L:text.html -comment',
  patterns: [{include: '#interpolation'}],
  repository: {
    interpolation: {
      begin: /{{/,
      beginCaptures: {
        0: {name: 'punctuation.definition.block.ts'},
      },
      end: /}}/,
      endCaptures: {
        0: {name: 'punctuation.definition.block.ts'},
      },
      contentName: 'expression.ng',
      patterns: [{include: 'expression.ng'}],
    },
  },
};
//# sourceMappingURL=template.js.map
