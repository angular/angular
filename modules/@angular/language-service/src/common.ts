/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileDirectiveMetadata, CompileDirectiveSummary, CompilePipeSummary} from '@angular/compiler';

import {Parser} from '@angular/compiler/src/expression_parser/parser';
import {Node as HtmlAst} from '@angular/compiler/src/ml_parser/ast';
import {ParseError} from '@angular/compiler/src/parse_util';
import {CssSelector} from '@angular/compiler/src/selector';
import {TemplateAst} from '@angular/compiler/src/template_parser/template_ast';

import {Diagnostic, TemplateSource} from './types';

export interface AstResult {
  htmlAst?: HtmlAst[];
  templateAst?: TemplateAst[];
  directive?: CompileDirectiveMetadata;
  directives?: CompileDirectiveSummary[];
  pipes?: CompilePipeSummary[];
  parseErrors?: ParseError[];
  expressionParser?: Parser;
  errors?: Diagnostic[];
}

export interface TemplateInfo {
  position?: number;
  fileName?: string;
  template: TemplateSource;
  htmlAst: HtmlAst[];
  directive: CompileDirectiveMetadata;
  directives: CompileDirectiveSummary[];
  pipes: CompilePipeSummary[];
  templateAst: TemplateAst[];
  expressionParser: Parser;
}

export interface AttrInfo {
  name: string;
  input?: boolean;
  output?: boolean;
  template?: boolean;
  fromHtml?: boolean;
}

export type SelectorInfo = {
  selectors: CssSelector[],
  map: Map<CssSelector, CompileDirectiveSummary>
};
