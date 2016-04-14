export {PLATFORM_DIRECTIVES, PLATFORM_PIPES} from 'angular2/src/core/platform_directives_and_pipes';
export * from 'angular2/src/compiler/template_ast';
export {TEMPLATE_TRANSFORMS} from 'angular2/src/compiler/template_parser';
export {CompilerConfig, RenderTypes} from './config';
export * from './compile_metadata';
export * from './offline_compiler';
export {RuntimeCompiler} from './runtime_compiler';
export * from 'angular2/src/compiler/url_resolver';
export * from 'angular2/src/compiler/xhr';

export {ViewResolver} from './view_resolver';
export {DirectiveResolver} from './directive_resolver';
export {PipeResolver} from './pipe_resolver';

import {assertionsEnabled, Type, CONST_EXPR} from 'angular2/src/facade/lang';
import {provide, Provider} from 'angular2/src/core/di';
import {TemplateParser} from 'angular2/src/compiler/template_parser';
import {HtmlParser} from 'angular2/src/compiler/html_parser';
import {DirectiveNormalizer} from 'angular2/src/compiler/directive_normalizer';
import {RuntimeMetadataResolver} from 'angular2/src/compiler/runtime_metadata';
import {StyleCompiler} from 'angular2/src/compiler/style_compiler';
import {ViewCompiler} from 'angular2/src/compiler/view_compiler/view_compiler';
import {CompilerConfig} from './config';
import {ComponentResolver} from 'angular2/src/core/linker/component_resolver';
import {RuntimeCompiler} from 'angular2/src/compiler/runtime_compiler';
import {ElementSchemaRegistry} from 'angular2/src/compiler/schema/element_schema_registry';
import {DomElementSchemaRegistry} from 'angular2/src/compiler/schema/dom_element_schema_registry';
import {UrlResolver, DEFAULT_PACKAGE_URL_PROVIDER} from 'angular2/src/compiler/url_resolver';
import {Parser} from './expression_parser/parser';
import {Lexer} from './expression_parser/lexer';
import {ViewResolver} from './view_resolver';
import {DirectiveResolver} from './directive_resolver';
import {PipeResolver} from './pipe_resolver';

function _createCompilerConfig() {
  return new CompilerConfig(assertionsEnabled(), false, true);
}

/**
 * A set of providers that provide `RuntimeCompiler` and its dependencies to use for
 * template compilation.
 */
export const COMPILER_PROVIDERS: Array<Type | Provider | any[]> = CONST_EXPR([
  Lexer,
  Parser,
  HtmlParser,
  TemplateParser,
  DirectiveNormalizer,
  RuntimeMetadataResolver,
  DEFAULT_PACKAGE_URL_PROVIDER,
  StyleCompiler,
  ViewCompiler,
  new Provider(CompilerConfig, {useFactory: _createCompilerConfig, deps: []}),
  RuntimeCompiler,
  new Provider(ComponentResolver, {useExisting: RuntimeCompiler}),
  DomElementSchemaRegistry,
  new Provider(ElementSchemaRegistry, {useExisting: DomElementSchemaRegistry}),
  UrlResolver,
  ViewResolver,
  DirectiveResolver,
  PipeResolver
]);
