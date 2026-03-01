/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'fs';

import {AngularHtml} from './angular-html';
import {AngularTs} from './angular-ts';
import {Expression} from './expression';
import {HostObjectLiteral} from './host-object-literal';
import {InlineStyles} from './inline-styles';
import {InlineTemplate} from './inline-template';
import {MarkdownFence} from './markdown-fence';
import {Template} from './template';
import {TemplateBlocks} from './template-blocks';
import {LetDeclaration} from './template-let-declaration';
import {TemplateTag} from './template-tag';
import {GrammarDefinition, JsonObject} from './types';

// Recursively transforms a TypeScript grammar definition into an object which can be processed by
// JSON.stringify to generate a valid TextMate JSON grammar definition
function processGrammar(grammar: GrammarDefinition): JsonObject {
  const processedGrammar: JsonObject = {};
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
function build(grammar: GrammarDefinition, filename: string): void {
  const processedGrammar: JsonObject = processGrammar(grammar);
  const grammarContent: string = JSON.stringify(processedGrammar, null, '  ') + '\n';

  if (!!process.env['JS_BINARY__TARGET']) {
    // Add `_` prefix when running under Bazel so the output filename is different than
    // the source tree to allow for write_source_files targets to refer to both by labels
    filename = `_${filename}`;
  }
  fs.writeFile(`vscode-ng-language-service/syntaxes/${filename}.json`, grammarContent, (error) => {
    if (error) throw error;
  });
}

build(Expression, 'expression');
build(Template, 'template');
build(InlineTemplate, 'inline-template');
build(InlineStyles, 'inline-styles');
build(TemplateBlocks, 'template-blocks');
build(TemplateTag, 'template-tag');
build(LetDeclaration, 'let-declaration');
build(HostObjectLiteral, 'host-object-literal');
build(AngularTs, 'angular-ts');
build(AngularHtml, 'angular-html');
build(MarkdownFence, 'markdown-fence');
