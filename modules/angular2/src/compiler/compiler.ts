import {RuntimeCompiler_} from "./runtime_compiler";
export {TemplateCompiler} from './template_compiler';
export {
  CompileDirectiveMetadata,
  CompileTypeMetadata,
  CompileTemplateMetadata
} from './directive_metadata';
export {SourceModule, SourceWithImports} from './source_module';
export {PLATFORM_DIRECTIVES, PLATFORM_PIPES} from 'angular2/src/core/platform_directives_and_pipes';
export * from 'angular2/src/compiler/template_ast';
export {TEMPLATE_TRANSFORMS} from 'angular2/src/compiler/template_parser';
import {assertionsEnabled, Type, CONST_EXPR} from 'angular2/src/facade/lang';
import {provide, Provider} from 'angular2/src/core/di';
import {TemplateParser} from 'angular2/src/compiler/template_parser';
import {HtmlParser} from 'angular2/src/compiler/html_parser';
import {TemplateNormalizer} from 'angular2/src/compiler/template_normalizer';
import {RuntimeMetadataResolver} from 'angular2/src/compiler/runtime_metadata';
import {ChangeDetectionCompiler} from 'angular2/src/compiler/change_detector_compiler';
import {StyleCompiler} from 'angular2/src/compiler/style_compiler';
import {ViewCompiler} from 'angular2/src/compiler/view_compiler';
import {ProtoViewCompiler} from 'angular2/src/compiler/proto_view_compiler';
import {TemplateCompiler} from 'angular2/src/compiler/template_compiler';
import {ChangeDetectorGenConfig} from 'angular2/src/core/change_detection/change_detection';
import {Compiler} from 'angular2/src/core/linker/compiler';
import {RuntimeCompiler} from 'angular2/src/compiler/runtime_compiler';
import {ElementSchemaRegistry} from 'angular2/src/compiler/schema/element_schema_registry';
import {DomElementSchemaRegistry} from 'angular2/src/compiler/schema/dom_element_schema_registry';
import {UrlResolver, DEFAULT_PACKAGE_URL_PROVIDER} from 'angular2/src/compiler/url_resolver';
import {Parser, Lexer} from 'angular2/src/core/change_detection/change_detection';

function _createChangeDetectorGenConfig() {
  return new ChangeDetectorGenConfig(assertionsEnabled(), false, true);
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
  TemplateNormalizer,
  RuntimeMetadataResolver,
  DEFAULT_PACKAGE_URL_PROVIDER,
  StyleCompiler,
  ProtoViewCompiler,
  ViewCompiler,
  ChangeDetectionCompiler,
  new Provider(ChangeDetectorGenConfig, {useFactory: _createChangeDetectorGenConfig, deps: []}),
  TemplateCompiler,
  new Provider(RuntimeCompiler, {useClass: RuntimeCompiler_}),
  new Provider(Compiler, {useExisting: RuntimeCompiler}),
  DomElementSchemaRegistry,
  new Provider(ElementSchemaRegistry, {useExisting: DomElementSchemaRegistry}),
  UrlResolver
]);
