/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as directive_normalizer from './directive_normalizer';
import * as lexer from './expression_parser/lexer';
import * as parser from './expression_parser/parser';
import * as metadata_resolver from './metadata_resolver';
import * as html_parser from './ml_parser/html_parser';
import * as interpolation_config from './ml_parser/interpolation_config';
import * as ng_module_compiler from './ng_module_compiler';
import * as path_util from './output/path_util';
import * as ts_emitter from './output/ts_emitter';
import * as parse_util from './parse_util';
import * as dom_element_schema_registry from './schema/dom_element_schema_registry';
import * as selector from './selector';
import * as style_compiler from './style_compiler';
import * as template_parser from './template_parser/template_parser';
import * as view_compiler from './view_compiler/view_compiler';

export const __compiler_private__: {
  _SelectorMatcher?: selector.SelectorMatcher; SelectorMatcher: typeof selector.SelectorMatcher;

  _CssSelector?: selector.CssSelector;
  CssSelector: typeof selector.CssSelector;

  _AssetUrl?: path_util.AssetUrl;
  AssetUrl: typeof path_util.AssetUrl;

  _ImportGenerator?: path_util.ImportGenerator;
  ImportGenerator: typeof path_util.ImportGenerator;

  _CompileMetadataResolver?: metadata_resolver.CompileMetadataResolver;
  CompileMetadataResolver: typeof metadata_resolver.CompileMetadataResolver;

  _HtmlParser?: html_parser.HtmlParser;
  HtmlParser: typeof html_parser.HtmlParser;

  _InterpolationConfig?: interpolation_config.InterpolationConfig;
  InterpolationConfig: typeof interpolation_config.InterpolationConfig;

  _DirectiveNormalizer?: directive_normalizer.DirectiveNormalizer;
  DirectiveNormalizer: typeof directive_normalizer.DirectiveNormalizer;

  _Lexer?: lexer.Lexer;
  Lexer: typeof lexer.Lexer;

  _Parser?: parser.Parser;
  Parser: typeof parser.Parser;

  _ParseLocation?: parse_util.ParseLocation;
  ParseLocation: typeof parse_util.ParseLocation;

  _ParseError?: parse_util.ParseError;
  ParseError: typeof parse_util.ParseError;

  _ParseErrorLevel?: parse_util.ParseErrorLevel;
  ParseErrorLevel: typeof parse_util.ParseErrorLevel;

  _ParseSourceFile?: parse_util.ParseSourceFile;
  ParseSourceFile: typeof parse_util.ParseSourceFile;

  _ParseSourceSpan?: parse_util.ParseSourceSpan;
  ParseSourceSpan: typeof parse_util.ParseSourceSpan;

  _TemplateParser?: template_parser.TemplateParser;
  TemplateParser: typeof template_parser.TemplateParser;

  _TemplateParseResult?: template_parser.TemplateParseResult;

  _DomElementSchemaRegistry?: dom_element_schema_registry.DomElementSchemaRegistry;
  DomElementSchemaRegistry: typeof dom_element_schema_registry.DomElementSchemaRegistry;

  _StyleCompiler?: style_compiler.StyleCompiler;
  StyleCompiler: typeof style_compiler.StyleCompiler;

  _ViewCompiler?: view_compiler.ViewCompiler;
  ViewCompiler: typeof view_compiler.ViewCompiler;

  _NgModuleCompiler?: ng_module_compiler.NgModuleCompiler;
  NgModuleCompiler: typeof ng_module_compiler.NgModuleCompiler;

  _TypeScriptEmitter?: ts_emitter.TypeScriptEmitter;
  TypeScriptEmitter: typeof ts_emitter.TypeScriptEmitter;

} = {
  SelectorMatcher: selector.SelectorMatcher,
  CssSelector: selector.CssSelector,
  AssetUrl: path_util.AssetUrl,
  ImportGenerator: path_util.ImportGenerator,
  CompileMetadataResolver: metadata_resolver.CompileMetadataResolver,
  HtmlParser: html_parser.HtmlParser,
  InterpolationConfig: interpolation_config.InterpolationConfig,
  DirectiveNormalizer: directive_normalizer.DirectiveNormalizer,
  Lexer: lexer.Lexer,
  Parser: parser.Parser,
  ParseLocation: parse_util.ParseLocation,
  ParseError: parse_util.ParseError,
  ParseErrorLevel: parse_util.ParseErrorLevel,
  ParseSourceFile: parse_util.ParseSourceFile,
  ParseSourceSpan: parse_util.ParseSourceSpan,
  TemplateParser: template_parser.TemplateParser,
  DomElementSchemaRegistry: dom_element_schema_registry.DomElementSchemaRegistry,
  StyleCompiler: style_compiler.StyleCompiler,
  ViewCompiler: view_compiler.ViewCompiler,
  NgModuleCompiler: ng_module_compiler.NgModuleCompiler,
  TypeScriptEmitter: ts_emitter.TypeScriptEmitter
};
