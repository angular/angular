'use strict';
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', {enumerable: true, value: v});
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', {value: true});
const fs = __importStar(require('fs'));
const expression_1 = require('./expression');
const host_object_literal_1 = require('./host-object-literal');
const inline_styles_1 = require('./inline-styles');
const inline_template_1 = require('./inline-template');
const template_1 = require('./template');
const template_blocks_1 = require('./template-blocks');
const template_let_declaration_1 = require('./template-let-declaration');
const template_tag_1 = require('./template-tag');
// Recursively transforms a TypeScript grammar definition into an object which can be processed by
// JSON.stringify to generate a valid TextMate JSON grammar definition
function processGrammar(grammar) {
  const processedGrammar = {};
  for (const [key, value] of Object.entries(grammar)) {
    if (typeof value === 'string') {
      processedGrammar[key] = value;
    } else if (value instanceof RegExp) {
      // Escape backslashes/quote marks and trim the demarcating `/` characters from a regex literal
      processedGrammar[key] = value.toString().replace(/^\/|\/$/g, '');
    } else if (value instanceof Array) {
      processedGrammar[key] = value.map(processGrammar);
    } else {
      processedGrammar[key] = processGrammar(value);
    }
  }
  return processedGrammar;
}
// Build a TextMate grammar JSON file from a source TypeScript object
function build(grammar, filename) {
  const processedGrammar = processGrammar(grammar);
  const grammarContent = JSON.stringify(processedGrammar, null, '  ') + '\n';
  if (!!process.env['JS_BINARY__TARGET']) {
    // Add `_` prefix when running under Bazel so the output filename is different than
    // the source tree to allow for write_source_files targets to refer to both by labels
    filename = `_${filename}`;
  }
  fs.writeFile(`vscode-ng-language-service/syntaxes/${filename}.json`, grammarContent, (error) => {
    if (error) throw error;
  });
}
build(expression_1.Expression, 'expression');
build(template_1.Template, 'template');
build(inline_template_1.InlineTemplate, 'inline-template');
build(inline_styles_1.InlineStyles, 'inline-styles');
build(template_blocks_1.TemplateBlocks, 'template-blocks');
build(template_tag_1.TemplateTag, 'template-tag');
build(template_let_declaration_1.LetDeclaration, 'let-declaration');
build(host_object_literal_1.HostObjectLiteral, 'host-object-literal');
//# sourceMappingURL=build.js.map
