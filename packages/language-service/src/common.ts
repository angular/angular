/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileDirectiveMetadata, CompileDirectiveSummary, CompilePipeSummary, CssSelector, Node as HtmlAst, ParseError, Parser, TemplateAst} from '@angular/compiler';

import {TemplateSource} from './types';

export interface AstResult {
  htmlAst: HtmlAst[];
  templateAst: TemplateAst[];
  directive: CompileDirectiveMetadata;
  directives: CompileDirectiveSummary[];
  pipes: CompilePipeSummary[];
  parseErrors?: ParseError[];
  expressionParser: Parser;
  template: TemplateSource;
}

export type SelectorInfo = {
  selectors: CssSelector[],
  map: Map<CssSelector, CompileDirectiveSummary>
};
