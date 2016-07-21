/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as directive_normalizer from './src/directive_normalizer';
import * as lexer from './src/expression_parser/lexer';
import * as parser from './src/expression_parser/parser';
import * as html_parser from './src/html_parser/html_parser';
import * as interpolation_config from './src/html_parser/interpolation_config';
import * as metadata_resolver from './src/metadata_resolver';
import * as ng_module_compiler from './src/ng_module_compiler';
import * as path_util from './src/output/path_util';
import * as ts_emitter from './src/output/ts_emitter';
import * as parse_util from './src/parse_util';
import * as dom_element_schema_registry from './src/schema/dom_element_schema_registry';
import * as selector from './src/selector';
import * as style_compiler from './src/style_compiler';
import * as template_parser from './src/template_parser/template_parser';
import * as view_compiler from './src/view_compiler/view_compiler';

export namespace __compiler_private__ {
export type SelectorMatcher = selector.SelectorMatcher;
export var SelectorMatcher = selector.SelectorMatcher;

export type CssSelector = selector.CssSelector;
export var CssSelector = selector.CssSelector;

export type AssetUrl = path_util.AssetUrl;
export var AssetUrl = path_util.AssetUrl;

export type ImportGenerator = path_util.ImportGenerator;
export var ImportGenerator = path_util.ImportGenerator;

export type CompileMetadataResolver = metadata_resolver.CompileMetadataResolver;
export var CompileMetadataResolver = metadata_resolver.CompileMetadataResolver;

export type HtmlParser = html_parser.HtmlParser;
export var HtmlParser = html_parser.HtmlParser;

export type InterpolationConfig = interpolation_config.InterpolationConfig;
export var InterpolationConfig = interpolation_config.InterpolationConfig;

export type DirectiveNormalizer = directive_normalizer.DirectiveNormalizer;
export var DirectiveNormalizer = directive_normalizer.DirectiveNormalizer;

export type Lexer = lexer.Lexer;
export var Lexer = lexer.Lexer;

export type Parser = parser.Parser;
export var Parser = parser.Parser;

export type ParseLocation = parse_util.ParseLocation;
export var ParseLocation = parse_util.ParseLocation;

export type ParseError = parse_util.ParseError;
export var ParseError = parse_util.ParseError;

export type ParseErrorLevel = parse_util.ParseErrorLevel;
export var ParseErrorLevel = parse_util.ParseErrorLevel;

export type ParseSourceFile = parse_util.ParseSourceFile;
export var ParseSourceFile = parse_util.ParseSourceFile;

export type ParseSourceSpan = parse_util.ParseSourceSpan;
export var ParseSourceSpan = parse_util.ParseSourceSpan;

export type TemplateParser = template_parser.TemplateParser;
export var TemplateParser = template_parser.TemplateParser;

export type TemplateParseResult = template_parser.TemplateParseResult;

export type DomElementSchemaRegistry = dom_element_schema_registry.DomElementSchemaRegistry;
export var DomElementSchemaRegistry = dom_element_schema_registry.DomElementSchemaRegistry;

export type StyleCompiler = style_compiler.StyleCompiler;
export var StyleCompiler = style_compiler.StyleCompiler;

export type ViewCompiler = view_compiler.ViewCompiler;
export var ViewCompiler = view_compiler.ViewCompiler;

export type NgModuleCompiler = ng_module_compiler.NgModuleCompiler;
export var NgModuleCompiler = ng_module_compiler.NgModuleCompiler;

export type TypeScriptEmitter = ts_emitter.TypeScriptEmitter;
export var TypeScriptEmitter = ts_emitter.TypeScriptEmitter;
}
